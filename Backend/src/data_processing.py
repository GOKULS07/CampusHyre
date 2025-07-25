import textract
import re
import nltk
import spacy

nltk.data.path.append("C:/Users/SELVA/AppData/Roaming/nltk_data")  # Or wherever punkt got installed

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('stopwords')
nlp = spacy.load('en_core_web_sm')

def data_load(file):
    """Reads different types of source files and returns text content."""
    return textract.process(file).decode('utf-8')

def write_file(file_name, write_mode, write_string):
    """Writes the Resume and JD comparison result to an output file."""
    with open(file_name, write_mode, encoding='utf-8') as output_file:
        output_file.write(write_string + '\n\n')
        output_file.write('-' * 73 + '\n\n')

def clean_text(text):
    """Cleans non-ASCII special characters from input text data."""
    return re.sub(r'[^a-zA-Z0-9\s/]', '', text).replace('/', ' ')

def filter_token_tag(tagged_token_list, filter_tag_list):
    """Filters tokens based on specified part-of-speech tags."""
    return [str(t[0]) for t in tagged_token_list if t[1] in filter_tag_list]

def unique_tokens(token_list):
    """Removes duplicate tokens from the list while preserving order."""
    seen = set()
    return [x.lower() for x in token_list if not (x.lower() in seen or seen.add(x.lower()))]

def nltk_tokenizer(text):
    """Tokenizes text using NLTK."""
    return nltk.word_tokenize(text)

def nltk_pos_tag(token_list):
    """Applies POS tagging using NLTK."""
    return nltk.pos_tag(token_list)

def nltk_stopwords_removal(token_list):
    """Removes stopwords using NLTK."""
    stop_words = set(nltk.corpus.stopwords.words('english'))
    return [w for w in token_list if w.lower() not in stop_words]

def nltk_keywords(data):
    """Extracts keywords from text using NLTK."""
    tokens = nltk_tokenizer(clean_text(data))
    tagged_tokens = nltk_pos_tag(tokens)
    keywords = filter_token_tag(tagged_tokens, ['NNP', 'NN', 'VBP', 'JJ'])
    return unique_tokens(nltk_stopwords_removal(keywords))

def spacy_tokenizer(text):
    """Tokenizes text using spaCy."""
    return nlp(text)

def spacy_pos_tag(token_list):
    """Applies POS tagging using spaCy."""
    return [(tok, tok.tag_) for tok in token_list]

def spacy_stopwords_removal(token_list):
    '''
    This function removes stopwords from the input token list using the spacy stopwords dictionary.
    Input: Token List (list of strings)
    Output: Stopwords filtered list (list of strings)
    '''
    stop_words = nlp.Defaults.stop_words
    return [w for w in token_list if w.lower() not in stop_words]  # Fix: w is now a string

def spacy_keywords(data):
    """Extracts keywords from text using spaCy."""
    tokens = spacy_tokenizer(clean_text(data))
    tagged_tokens = spacy_pos_tag(tokens)
    keywords = filter_token_tag(tagged_tokens, ['NNP'])
    return unique_tokens(spacy_stopwords_removal(keywords))




