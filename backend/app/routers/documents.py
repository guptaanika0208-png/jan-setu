"""
Documents router - the "Encrypted Document Vault".

Secure upload validation implemented here:
  - MIME allow-list (image/jpeg, image/png, application/pdf only)
  - Max file size enforced
  - SHA-256 hash computed for integrity + dedup
  - File bytes encrypted with Fernet (AES) before being written to disk
  - Filenames sanitized (never trust the client-provided filename for paths)

For the hackathon demo, encrypted files are written to local disk under
`storage/vault/`. In production this would be swapped for an encrypted
S3/Supabase bucket - the encrypt/decrypt calls stay identical either way.
"""
import hashlib
import os
import re
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import decrypt_field, encrypt_field
from app.db.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
VAULT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "storage", "vault")


def _sanitize_filename(filename: str) -> str:
    base = re.sub(r"[^A-Za-z0-9_.-]", "_", filename)
    return base[:150]


@router.get("", response_model=list[DocumentResponse])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc()).all()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    doc_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only JPEG, PNG, or PDF files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File exceeds the 5MB limit")

    file_hash = hashlib.sha256(contents).hexdigest()
    safe_name = _sanitize_filename(file.filename or "document")
    stored_name = f"{uuid.uuid4()}_{safe_name}.enc"

    os.makedirs(VAULT_DIR, exist_ok=True)
    encrypted_bytes = encrypt_field(contents.hex())  # encrypt hex-encoded bytes as a string
    storage_path = os.path.join(VAULT_DIR, stored_name)
    with open(storage_path, "w") as f:
        f.write(encrypted_bytes)

    document = Document(
        user_id=current_user.id,
        doc_type=doc_type,
        file_name=safe_name,
        storage_path=storage_path,
        mime_type=file.content_type,
        file_hash=file_hash,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    if os.path.exists(document.storage_path):
        os.remove(document.storage_path)
    db.delete(document)
    db.commit()
