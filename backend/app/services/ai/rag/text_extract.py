from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class ExtractedDoc:
    text: str
    course_id: Optional[str]
    module_id: Optional[str]
    title_hint: Optional[str]


_JSX_COMMENT_RE = re.compile(r"\{\/\*[\s\S]*?\*\/\}")
_TAG_RE = re.compile(r"<[^>]+>")
_JS_EXPR_RE = re.compile(r"\{[\s\S]*?\}")
_IMPORT_EXPORT_RE = re.compile(r"^\s*(import|export)\b.*$", re.MULTILINE)


def _normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # collapse repeated whitespace but keep newlines
    text = re.sub(r"[\t\f\v]+", " ", text)
    text = re.sub(r" +", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_from_jsx(source: str) -> ExtractedDoc:
    """Best-effort JSX -> readable text.

    This does not try to be a full JS/JSX parser; it extracts human-visible strings
    that appear between tags and basic headings/paragraphs.
    """
    course_id = None
    module_id = None

    course_match = re.search(r"courseId=\"([^\"]+)\"", source)
    if course_match:
        course_id = course_match.group(1)

    module_match = re.search(r"moduleId=\"([^\"]+)\"", source)
    if module_match:
        module_id = module_match.group(1)

    # Drop import/export lines (mostly noise)
    text = _IMPORT_EXPORT_RE.sub("", source)

    # Remove JSX comments and JS expressions
    text = _JSX_COMMENT_RE.sub("\n", text)
    text = _JS_EXPR_RE.sub("\n", text)

    # Replace tags with newlines (preserves some structure)
    text = _TAG_RE.sub("\n", text)

    # Remove leftover braces or JSX fragments
    text = text.replace("</>", "\n").replace("<>", "\n")

    text = _normalize_text(text)

    title_hint = None
    # crude heuristic: first non-empty line that looks like a heading
    for line in text.split("\n"):
        line = line.strip()
        if len(line) >= 8:
            title_hint = line
            break

    return ExtractedDoc(text=text, course_id=course_id, module_id=module_id, title_hint=title_hint)


def extract_from_markdown(source: str) -> ExtractedDoc:
    text = _normalize_text(source)

    title_hint = None
    for line in text.split("\n"):
        if line.startswith("#"):
            title_hint = line.lstrip("#").strip()
            if title_hint:
                break

    return ExtractedDoc(text=text, course_id=None, module_id=None, title_hint=title_hint)


def extract_file_text(path: str, content: str) -> ExtractedDoc:
    ext = os.path.splitext(path)[1].lower()
    if ext in {".md", ".markdown"}:
        return extract_from_markdown(content)
    if ext in {".jsx", ".tsx", ".js", ".ts"}:
        return extract_from_jsx(content)

    return ExtractedDoc(text=_normalize_text(content), course_id=None, module_id=None, title_hint=None)
