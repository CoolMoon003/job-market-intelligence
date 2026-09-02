import fitz  # PyMuPDF
import docx


def extract_text_from_pdf(file_path):
    text = ""

    pdf = fitz.open(file_path)

    for page in pdf:
        text += page.get_text()

    pdf.close()
    return text


def extract_text_from_docx(file_path):
    document = docx.Document(file_path)

    text = []
    for paragraph in document.paragraphs:
        text.append(paragraph.text)

    return "\n".join(text)


def extract_resume_text(file_path):
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)

    elif file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)

    else:
        raise ValueError("Only PDF and DOCX files are supported")   