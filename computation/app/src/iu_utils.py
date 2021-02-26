# %% codecell\
""" Standard library with utilities for working with Idea Units """


def iu_pprint(sent, gold=False, opener="[", closer="]"):
    """
    This function prints sentences nicely with their IU numbers in brackets.
    You can customize the brackets by changing the opener and
    closer parameters
    """

    texts = [token.text for token in sent]
    indexes = None
    if gold is False:
        indexes = [token._.iu_index for token in sent]
    else:
        indexes = [token._.gold_iu_index for token in sent]
    res = ""
    cur_idx = None
    for i in range(len(texts)):
        if indexes[i] != cur_idx:
            cur_idx = indexes[i]
            res += closer+opener+"{}|".format(cur_idx)
        res += "{} ".format(texts[i])
    # add final closed bracket ] at the end of the string
    res += closer
    # crop first closed bracket ] from the beginning of the string
    res = res[1:]
    return res
