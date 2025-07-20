import io
import fitz 
from flask import request, jsonify, send_file
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import data_processing as dp

# ─── ATS Check Function ──────────────────────────────

def extract_text_from_pdf(file):
    try:
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text("text")
        return text if text.strip() else "No text found in the document."
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None


def ats_checks():
    # Step 1: Check if resume is uploaded
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Step 2: Get JD text from form
    job_description = request.form.get('jobDescription')

    # Step 3: Extract text from PDF
    data_resume = extract_text_from_pdf(file)
    if not data_resume:
        return jsonify({'error': 'Failed to extract text from resume'}), 400

    # Step 4: Keyword extraction using spaCy and NLTK
    keywords_jd = dp.spacy_keywords(job_description)
    keywords_resume = dp.nltk_keywords(data_resume)

    matched_keywords = [word for word in keywords_jd if word in keywords_resume]
    match_percentage = round((len(matched_keywords) / len(keywords_jd)) * 100, 2) if keywords_jd else 0

    # Step 5: Cosine similarity
    vectorizer = CountVectorizer()
    count_matrix = vectorizer.fit_transform([job_description, data_resume])
    cosine_match_percentage = round(cosine_similarity(count_matrix)[0][1] * 100, 2)

    # Step 6: Generate report
    report_content = f"""
Match Percentage Based on Keywords: {match_percentage}%
Match Percentage Based on Cosine Similarity: {cosine_match_percentage}%

Job Description Keywords: {', '.join(keywords_jd)}
Resume Keywords: {', '.join(keywords_resume)}

Matched Keywords: {', '.join(matched_keywords)}

Recommendations:
- Try to include unmatched keywords in your Resume to improve JD-Resume compatibility.
"""

    report_file = io.BytesIO()
    report_file.write(report_content.encode('utf-8'))
    report_file.seek(0)

    return send_file(report_file, as_attachment=True, download_name='ats_check_report.txt', mimetype='text/plain')
