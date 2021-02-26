# %%md
# This file includes all the functions to segment sentences into idea units

# %%codecell
#import nltk
#from src.data import import_file, clean_str
#import spacy
#from spacy.tokens import Token
#nlp = spacy.load("en_core_web_sm")
#import re
from itertools import combinations
from functools import cmp_to_key
from collections import deque
from iu_utils import iu_pprint
from pprint import pprint


from data import read_filter
##initialize the list of filtered IUs from an external file
filter_file = "./src/transition_signals.txt"
filtered_ius = read_filter(filter_file)

# %%codecell
## Wrapper iu extraction function.
#  In input it expects a file parsed with spacy
#  No output is expected, as the Idea Units will be labeled in the spacy tokens


def label_ius(file):
    s_idx=0
    for sentence in file:
        root = sentence[0].sent.root
        #print("**Sentence:\n{}".format(sentence))
        #print("*root: {}, POS: {}".format(root.text,root.pos_))

        to_process = tag_nodes(sentence)
        if len(to_process) is 0:
            # no rule is applicable, segment the full sentence.
            #print("No rule applicable to sent:\n\t{}".format(sentence))
            to_process[root] = ["UNL"]
        to_process = order_nodes_bfs_dict(to_process)
        color_ius(sentence, to_process, s_idx)

        inline_fixes(sentence)
        #print(iu_pprint(sentence))
        #print()
        s_idx +=1
    return None

subj = ["nsubj","nsubjpass","csubj","csubjpass"]

#this function says if rule 1 is applyable to word and all its dependants
def is_V_with_S(word):
    res = False
    #loop only if the word is a verb
    if word.pos_ is "VERB" or word.pos_ is "AUX":
        #don't split multiple auxiliaries as of Rule 4
        if word.dep_ not in subj:
            for child in word.children:
                #if I find one subject as a dependant
                if child.dep_ in subj:
                    res = True
                    break
    return res

## compute a bfs to find the extraction order of nodes
def order_nodes_bfs_dict(nodelist):
    # get the root
    root = list(nodelist.keys())[0].sent.root
    order = []
    q = deque([root])
    # end the loop if I found all the nodes or if I explored the whole tree
    while q and nodelist:
        #pop child and add grandchildren to the queue
        cur_node = q.popleft()
        q.extend(cur_node.children)

        # check node
        if cur_node in nodelist.keys():
            order.append([cur_node,nodelist[cur_node]])
            nodelist.pop(cur_node)
    #filter the unwanted IUs
    for node_arr in order:
        #get the head node of the IU
        node = node_arr[0]
        #generate the IU text
        iu_text = " ".join(t.text for t in node.subtree)
        #if the iu.lowercase is in the filtered list:
        if iu_text.lower() in filtered_ius:
            #print("Filtering IU: {}".format(iu_text))
            order.remove(node_arr)
    order.reverse() # the extraction order needs to be reversed
    return order
'''
# Bool function for Rule 2
def is_relcl(word):
    res = False
    #enter the loop only if we have a relative clause
    if word.dep_ is "relcl":
        for child in word.children:
            # if we have a pronoun
            if child.dep_ is "mark":
                res = True
                break
    return res
'''
# bool function for Rule 2
def is_sconj(word):
    res = False
    #the sub conjunction is the introducion of a prepositional phrase
    if word.pos_ is "SCONJ" and word.dep_ is "prep":
        res = True
    if word.pos_ is "AUX" or word.pos_ is "VERB":
        for child in word.children:
            # if we have a sconj
            if child.dep_ is "mark" and child.pos_ is "SCONJ":
                res = True
                break
    return res

# Rule 2B
def is_complementizer(word):
    res = False
    #enter the loop only if we have a clausal complement
    if word.dep_ is "ccomp":
        for child in word.children:
            # if we have a pronoun
            if child.dep_ is "mark":
                res = True
                break
    return res
    ##TODO:
    #Maybe filter relcl that are too short (I want to buy something to drink)

## This function finds all Prepositional phrases as Prepositional complements
#  It will return all prepostional modifiers
# that are followed by prepostional complements
def find_PP_PC(sentence):
    preps = []
    for i in range(len(sentence)):
        if sentence[i].dep_ is "prep":
            #check if I still have more words before the end of the sentence
            if (i+1) < len(sentence):
                #if my preposition is followed by the
                if sentence[i+1].dep_ is "pcomp":
                    preps.append(i)
    return preps

def rule_PP(sentence, s_idx):
    #Prepositional phrases as Prepositional complements are phrases
    #formed by a preposition directly followed by a Prepositional complement
    # I suggest using this instead of the arbitrary 5 word limit
    return None

## a sequence is isolated if I only have an arc between it and the rest of the
## sentence. either 1 head or 1 child.
def is_isolated(sequence):
    outside_connections = 0
    for word in sequence:
        #if word does not have the attribute head, it is the root
        if hasattr(word, "head"):
            if word.head not in sequence:
                outside_connections +=1
        for child in word.children:
            if child not in sequence:
                outside_connections += 1
    #print(outside_connections)
    return outside_connections == 1

## given a sequence, returns the head of the subtree
def find_seq_head(sequence):
    node = sequence[0]
    root = node.sent.root
    if node is not root:
        father = node.head
        while father in sequence:
            node = father
            father = node.head
            # a root father will not have a head
            if father is root:
                node = father
                break
    return node

def citation_check(node):
    res = False
    if node.text.isdigit():
        #the word is a digit and only child of the appos
        if len([child for child in node.children]) is 0:
            #Citation!
            res = True
    return res

def stopword_check(node):
    res = False
    #print("node: {}".format(node))
    #print("is_stop: {}".format(node.is_stop))
    #print("pos: {}".format(node.pos_))
    if node.is_stop or node.pos_ is "PUNCT":
        res = True
        for child in node.children:
            res = res and stopword_check(child)
    return res

def tag_parens(sentence):
    tag_list = []
    q = []
    word_idx = 0
    for word in sentence:
        if word.text is "(":
            q.append((word, word_idx))
        elif word.text is ")":
            #pop the last (
            open_idx = None
            for el, idx in reversed(q):
                if el.text is "(":
                    q.remove((el,idx))
                    open_idx = idx
                    break
            # I found an open paren
            if open_idx is not None:
                # you can slice a sentence by the 2 indexes to find the substr
                slice = sentence[open_idx+1:word_idx]
                ##CHECK IF THIS SEGMENT OF TEXT IS ISOLATED
                ##FROM THE REST OF THE SENT
                if is_isolated(slice):
                    slice_head = find_seq_head(slice)
                    if citation_check(slice_head):
                        #print("R3parens - filtered due to citation")
                        pass
                    else:
                        tag_list.append([slice_head,"R3.1"])
        word_idx +=1
    return tag_list

def tag_hyphens(sentence):
    tag_list = []
    q = []
    word_idx = 0
    for word in sentence:
        if word.text is "-":
            #first hyphen
            if len(q) is 0:
                q.append(word_idx)
            else:
                prev_idx = q[len(q)-1]
                slice = sentence[prev_idx+1:word_idx]
                if is_isolated(slice):
                    slice_head = find_seq_head(slice)
                    if citation_check(slice_head):
                        #print("R3hypen - filtered due to citation")
                        pass
                    else:
                        tag_list.append([slice_head,"R3.1"])
                else:
                    #maybe the next hyphen couple will be a parenthetic clause
                    q.append(word_idx)
        word_idx +=1
    return tag_list

def tag_commas(sentence):
    tag_list = []
    q = []
    word_idx = 0
    for word in sentence:
        #for the first comma I want to check the slice from the beginning of the
        #sentence.
        prev_idx = -1
        #analize slices between the commas AND
        #the last slice between the last slice and the end of the sentence
        is_valid_last_slice = word_idx == len(sentence)-1 and len(q) is not 0
        if word.text is "," or is_valid_last_slice:
            #if we have found some commas beforehand
            if len(q) is not 0:
                #start from
                prev_idx = q[len(q)-1]
            # I don't include commas in the slices. This is because they have
            # weird dependencies. I will manually fix them with inline_fixes()
            # This has the sideffect of making it easier to find the right iu
            # when the first IU in a sentence is comprised of stopwords.
            # The comma will tell me where to attach the stopword IU.
            slice = sentence[prev_idx+1:word_idx]
            #print("analyzing slice \"{}\"".format(slice))
            if is_isolated(slice):
                slice_head = find_seq_head(slice)
                ## RULE 3 EXCEPTIONS
                if citation_check(slice_head):
                    #print("R3comma - filtered due to citation")
                    #print("--- {} ---".format(slice))
                    pass
                elif stopword_check(slice_head):
                    #print("R3B - filtered due to stopword_check")
                    #print("--- {} ---".format(slice))
                    tag_list.append([slice_head,"JOIN"])
                else:
                    #print("Splitting! Rule R3Bc")
                    #print("--- {} ---".format(slice))
                    tag_list.append([slice_head,"R3"])
            #I always want to keep track of the last comma I found.
            q.append(word_idx)
        word_idx +=1
    return tag_list

#rule 5 and 6
def is_infinive_clause(word):
    res = False
    if word.dep_ is "acl" or word.dep_ is "advcl":
        #infinitival
        if word.tag_ == "TO" or word.tag_ == "VB":
            res = True
        #gerund
        elif word.tag_ == "VBG" or word.tag_ == "VBN":
            res = True
        #else:
            #print(word, word.tag_, word.dep_)
    return res

# boolean form of rule 7b
def is_appos(word):
    res = False
    if word.dep_ is "appos":
        # check if the apposition is a citation:
        if citation_check(word):
            #Citation!
            #print("R3.2 - filtered due to citation")
            pass
        else:
            res = True
    return res

#boolean for rule 7c
def is_infinitive_verbal(word):
    res = False
    #a verb is infinitive
    if word.pos_ is "VERB" and word.dep_ is "xcomp" and word.tag_ == "VB":
        #print("VERBAL!")
        #print("word: {}, head: {}, head.pos: {}".format(word, word.head, word.head.pos_))
        #Check if we have the auxiliar TO
        for child in word.children:
            if child.tag_ == "TO":
                res = True
                break
        '''
        for child in word.children:
            # the verbal is preceded by to
            bool = child.text.lower() == "to"
            # to is an infinitival to
            bool = bool and child.pos_ is "PART"
            # to is an auxiliary
            bool = bool and child.dep_ is "aux"
            if  bool is True:
                res = True
                break
        '''
    return res

def find_long_PP(sent, tagged_nodes):
    def add_node(word,rule):
        if word not in tagged_nodes.keys():
            tagged_nodes[word] = [rule]
        else:
            tagged_nodes[word].append(rule)
    already_marked = []
    #looking from right to left so that I ensure 5 long pps
    #for word in reversed(sent):
    for word in sent:
        #if the word is a prepositional modifier:
        if word not in already_marked:
            #if the pp head is directly dependant on a verb
            if word.dep_ is "prep" and word.head.pos_ in ["AUX", "VERB"]:
                #count all the children that are not already labeled
                visited = []
                q = deque([word])
                lenght = 0
                while len(q)>0:
                    el = q.popleft()
                    visited.append(el)
                    if el not in tagged_nodes.keys():
                        ## add 1 to the word lenght
                        if word.pos_ != "PUNCT":
                            lenght +=1
                        q.extend(el.children)
                #if the pp is long enough
                if lenght >= 5:
                    already_marked.extend(visited)
                    add_node(word,"R8")
    return tagged_nodes

def inline_fixes(sent):
    previous_label = None
    attach_prev = [",",".",")","!","?"]
    for i in range(len(sent)):
        word = sent[i]
        ## PUNCTUATION FIX
        # attach each comma, fullstop, ), ! and ? to the previous word
        if word.text in attach_prev:
            #OOB check
            if i > 0:
                word._.iu_index = sent[i-1]._.iu_index
        elif word.text is "(":
            if i < len(sent): #OOB check
                word._.iu_index = sent[i+1]._.iu_index
        #conjunctions go with their follwing word
        if word.pos_ is "CCONJ":
            if i < len(sent): #OOB check
                word._.iu_index = sent[i+1]._.iu_index
        ## JOIN FIX
        #we attach meaningless ius (stopwords) to the left.
        #If they are in the initial position, then we attach them to the right
        if word._.iu_index is "JOIN":
            if previous_label is None:
                ##find a new label:
                previous_label = "JOIN"
                #go forward until I find a new label, then backtrack
                j = i+1
                #print("scanning right...")
                while previous_label is "JOIN" and j < len(sent):
                    #print(sent[j], sent[j]._.iu_index)
                    previous_label = sent[j]._.iu_index
                    j +=1
                #Now previous_label is correct
            #change the JOIN label
            word._.iu_index = previous_label

        #store every word's label (look left)
        previous_label = word._.iu_index
    return None

## This function tags all nodes that (along with their dependencies)
# need to be segmented.
def tag_nodes(sentence):
    res = {}
    def add_node(word,rule):
        if word not in res.keys():
            res[word] = [rule]
        else:
            res[word].append(rule)
    for word in sentence:
        if is_V_with_S(word):
            add_node(word,"R1")
            #print("V with S: {}".format(word))
        if is_sconj(word):
            add_node(word,"R2")
            #print("sconj: {}".format(word))
        if is_complementizer(word):
            add_node(word,"R2")
            #print("complementizer: {}".format(word))
        if is_infinive_clause(word):
            add_node(word,"R5")
            #print("acl: {}".format(word))
        if is_appos(word):
            add_node(word,"R3.2")
            #print("appos: {}".format(word))
        if is_infinitive_verbal(word):
            add_node(word,"R6.2")
            #print("verbal: {}".format(word))
    for tag in tag_parens(sentence):
        word, rule = tag
        add_node(word,rule)
    for tag in tag_hyphens(sentence):
        word, rule = tag
        add_node(word,rule)
    for tag in tag_commas(sentence):
        word, rule = tag
        add_node(word,rule)
    #pprint(res)
    #print("TAGGING LONG PPS")
    res = find_long_PP(sentence, res)
    #pprint(res)
    return res

## This function colors each word in the sentence according to
#  nodes found in the list to_process.
def color_ius(sentence, to_process, s_idx):
    iu_idx = 1
    for node, rule_labels in to_process:
        label = "JOIN"
        if "JOIN" not in rule_labels:
            label = "{}-{}-{}".format(s_idx,iu_idx,",".join(rule_labels))
        iu_idx += 1
        # color words according to Idea Unit following the order
        q = deque([node])
        while q:
            cur_node = q.popleft()
            q.extend(cur_node.children)
            #print(q)
            # only color unexplored nodes
            if cur_node._.iu_index is -1:
                cur_node._.iu_index = label
    return None
