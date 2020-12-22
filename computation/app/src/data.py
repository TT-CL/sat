# %%md
# This file handles data operations:
# * reading from disk,
# * string cleanup,
# * tokenization,
# * 3rd party parsing (stanford corenlp, spacy)
# The objective is to create a single function that preformats data
# This data will later be segmented in Idea Units
# %%codecell
#import nltk
import csv, json
from nltk.tokenize import sent_tokenize#, word_tokenize
from nltk.parse.corenlp import *
import spacy
from spacy.tokens import Token
import re
from src.iu_utils import *

# %%codecell
# Spacy Token Extension
Token.set_extension("iu_index", default=-1, force=True)

#from pathlib import Path
nlp = spacy.load("en_core_web_sm")
dep_parser = CoreNLPDependencyParser(url="http://localhost:9000")
gen_parser = CoreNLPParser(url="http://localhost:9000")
acceptable_models = ["spacy","corenlp_dep","corenlp_ps"]
# %%codecell
# functions
# string cleanup function
def clean_str(s):
    res = s
    res = res.replace("\s\\t\s"," ")
    res = res.replace("\s\\n\s"," ")
    res = res.replace("\s\\r\s"," ")
    res = res.replace("\s\\f\s"," ")
    res = res.replace("’","'")
    res = res.replace("“","\"")
    res = res.replace("”","\"")
    res = re.sub("\s+", " ", res) #replace multiple spaces with a single one
    res = res.strip()
    return res

## Simple file reader. Output is list of sentences
def read_file(filename):
    # read file from disk
    lines = []
    with open(filename) as file:
        #Tokenize sentences
        for row in file.readlines():
            #Skip empty lines and start lines
            cleaned_row = clean_str(row)
            if cleaned_row != "" and cleaned_row != "start":
                lines.append(cleaned_row)
    joined_lines = " ".join(lines)
    sents = sent_tokenize(joined_lines)
    return sents

##Simple buffer reader. Output is a list of sentences
def read_buffer(fileBuffer):
    # read file from disk
    lines = []
    byteString = fileBuffer.read()
    decodedString = byteString.decode('utf-8')
    #Tokenize sentences
    for row in decodedString.splitlines():
        #Skip empty lines and start lines
        cleaned_row = clean_str(row)
        if cleaned_row != "" and cleaned_row != "start":
            lines.append(cleaned_row)
    fileBuffer.close()
    joined_lines = " ".join(lines)
    sents = sent_tokenize(joined_lines)
    return sents

## Simple reader for files containing filters
def read_filter(filename):
    # read file from disk
    lines = []
    with open(filename) as file:
        #Tokenize sentences
        for row in file.readlines():
            #Skip empty lines and start lines
            cleaned_row = clean_str(row)
            if cleaned_row != "" and cleaned_row != "start":
                lines.append(cleaned_row.lower())
    return lines

## File parser
#   Accepted models:
#   "spacy" : spacy parsers
#   "corenlp_dep": Stanford CoreNLP dependency parser
#   "corenlp_ps": Stanford CoreNLP ps rule parser
def parse_file(sents, input_models=["spacy"]):
    #filter models with acceptable ones
    models = [model for model in input_models if model in acceptable_models]
    #instantiate a dict with each model as a key
    res = {}
    res["raw"] = sents #add raw file as well
    for model in models:
        res[model]=[]

    for sent in sents:
        for model in models:
            parsed_sent = None
            if model == "spacy":
                parsed_sent = nlp(sent.strip())
            elif model == "corenlp_dep":
                parsed_sent, = dep_parser.raw_parse(sent)
            elif model == "corenlp_ps":
                parsed_sent, = gen_parser.raw_parse(sent)
            res[model].append(parsed_sent)
    return res

## Wrapper AIO function to import a file.
# It will read from disk, perform cleanup and parse
# The @models argument accepts a list containing the parse models that the user
#   wishes to adopt
def import_file(f, models=["spacy"]):
    raws = None;
    if isinstance(f, str):
        raws = read_file(f)
    else:
        raws = read_buffer(f)
    file = parse_file(raws, models)
    return file

## This function retrieves all the filenames listed in ./data/names.txt
# this is to allow flexibility with the amount of files and avoid uploading
# sensitive data (like filenames) on VCS
def retrieve_filenames(
    namefile = "./data/BEA2019/names.txt", #file with the filenames
    folder = "./data/BEA2019/base/",):
    names = []
    sources = []
    sourceSection = False #bool flag to check if I am in the source section
    with open(namefile) as file:
        rows = file.readlines()
        for row in rows:
            if row[0] == "*":
                sourceSection = True
            else:
                if sourceSection:
                    sources.append(folder + row.strip())
                else:
                    names.append(folder + row.strip())
    #print("filenames")
    #print(names)
    #print(sources)
    return names, sources

## Wrapper function that imports, cleans and parses all the files at once
# The @models argument accepts a list containing the parse models that the user
#   wishes to adopt
def import_all_files(filenames, models=None):
    files = []
    for filename in filenames:
        try:
            files.append(import_file(filename, models))
        except:
            print("{} not found. Skipping...".format(filename))
    return files

## This function extracts the labeled IUS from a document and keeps track of
#  discontinuous Idea Units
def gen_iu_collection(sentences, gold=False):
    ius = {}
    disc_ius = set()
    label = lambda x: x._.iu_index
    # look at a different label for gold Ius
    if gold is True:
        label = lambda x: x._.gold_iu_index

    prev_label = None
    for sent in sentences:
        for word in sent:
            if prev_label is None:
                # for the first word initialize the dict entry and temp var
                prev_label = label(word)
                ius[label(word)] = []
            # if the label didn't change from the previous word I can assume
            # that this label already has a dict entry
            if label(word) is prev_label:
                ius[label(word)].append(word)
            # THE LABEL CHANGED!
            # if we don't have the label in the dict then add it and move on
            elif label(word) not in ius:
                ius[label(word)] = []
                ius[label(word)].append(word)
                prev_label = label(word)
            # the label is already in the dict. We have a discontinuous IU
            else:
                ius[label(word)].append(word)
                disc_ius.add(label(word))
                prev_label = label(word)
    return ius, disc_ius

def export_csv(table, filename):
    with open(filename, 'w', newline='') as writerFile:
        writer = csv.writer(writerFile, delimiter=';',quotechar='|')
        for row in table:
            writer.writerow(row)

def export_labeled_ius(text, filename):
    raw_sents = [iu_pprint(sent,opener = "", closer="\n") for sent in text]
    raw = "".join(raw_sents)
    with open(filename, 'w') as file:
        file.write(raw)
    return None

def prepare_json(text, doc_name, doc_type):
    data = {}
    data['doc_name'] = doc_name
    data['doc_type'] = doc_type
    data['sents']=[]
    disc_labels = [] #list of discontinuous labels
    idx_list = {}
    last_idx = None

    word_index = 0
    max_iu_index = 0
    cur_iu_index = 0

    for sent in text:
        sent_data = {}
        sent_data['words']=[]
        for token in sent:
            if token._.iu_index != last_idx:
                if token._.iu_index in idx_list.keys():
                    disc_labels.append(token._.iu_index)
                    cur_iu_index = idx_list[token._.iu_index]
                else:
                    max_iu_index = max_iu_index + 1
                    cur_iu_index = max_iu_index
                    idx_list[token._.iu_index] = cur_iu_index
                last_idx = token._.iu_index
            word = {
                'text' : token.text,
                'word_index' : word_index,
                'iu_index': cur_iu_index,
                'iu_label': token._.iu_index,
                'disc' : False
            }
            word_index = word_index + 1
            sent_data['words'].append(word)

        data['sents'].append(sent_data)
    for sent in data['sents']:
        for word in sent["words"]:
            if word['iu_label'] in disc_labels:
                word['disc'] = True
    return data

def export_labeled_json(text, filename, doc_name):
    doc_type = "Source text"
    if doc_name != "source":
        data['doc_type'] = "Summary text"
    data = prepare_json(text,doc_name,doc_type)
    with open(filename, 'w') as outputfile:
        json.dump(data,outputfile)