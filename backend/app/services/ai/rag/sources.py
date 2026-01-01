from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Iterable, List


@dataclass(frozen=True)
class RagSourceFile:
    path: str


def discover_source_files(repo_root: str) -> List[RagSourceFile]:
    """Collects Signum-specific source-of-truth content.

    - Frontend course JSX content
    - Project markdown docs (README, BACKEND.md, etc.)
    """

    patterns = [
        # Course content
        os.path.join(repo_root, "frontend", "src", "courses"),
        # Docs
        os.path.join(repo_root, "README.md"),
        os.path.join(repo_root, "AI_IMPLEMENTATION.md"),
        os.path.join(repo_root, "BACKEND.md"),
        os.path.join(repo_root, "FRONTEND.md"),
        os.path.join(repo_root, "ANTI_CHEAT_SYSTEM.md"),
        os.path.join(repo_root, "BLOCKCHAIN_CERTIFICATE_SYSTEM.md"),
        os.path.join(repo_root, "DATABASE_SCHEMA.md"),
        os.path.join(repo_root, "INTERACTIVE_LEARNING.md"),
        # Backend docs
        os.path.join(repo_root, "backend", "BACKEND_TESTING.md"),
        os.path.join(repo_root, "backend", "DOCKER_GUIDE.md"),
    ]

    files: List[RagSourceFile] = []

    # Walk courses dir
    courses_dir = patterns[0]
    if os.path.isdir(courses_dir):
        for root, _, filenames in os.walk(courses_dir):
            for filename in filenames:
                ext = os.path.splitext(filename)[1].lower()
                if ext in {".jsx", ".tsx", ".md", ".js", ".ts"}:
                    files.append(RagSourceFile(path=os.path.join(root, filename)))

    # Explicit docs
    for path in patterns[1:]:
        if os.path.isfile(path):
            files.append(RagSourceFile(path=path))

    # De-dupe while preserving order
    seen = set()
    deduped: List[RagSourceFile] = []
    for f in files:
        if f.path in seen:
            continue
        seen.add(f.path)
        deduped.append(f)

    return deduped


def iter_text_files(source_files: Iterable[RagSourceFile]) -> Iterable[RagSourceFile]:
    for f in source_files:
        if os.path.isfile(f.path):
            yield f
