"""
Logging Configuration for Signum Backend
Provides structured logging to server logs only (not exposed to clients)
"""

import logging
import sys
from datetime import datetime

# Configure logging format
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
DATE_FORMAT = '%Y-%m-%d %H:%M:%S'

def setup_logger(name: str) -> logging.Logger:
    """
    Create a logger instance for a module
    
    Args:
        name: Module name (usually __name__)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    logger.setLevel(logging.INFO)
    
    # Console handler (server-side only)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger

# Pre-configured loggers for common modules
certificate_logger = setup_logger('certificate_service')
metadata_logger = setup_logger('metadata_service')
assessment_logger = setup_logger('assessment_service')
ai_logger = setup_logger('ai_service')
auth_logger = setup_logger('auth_service')
