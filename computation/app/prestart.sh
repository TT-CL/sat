#!/bin/sh
#Check if the env variables are set, if not use the defaults
custom_model="${CUSTOM_VECTORS:-models/vectors.txt}"
gensim_model="${GENSIM_MODEL:-models/gensim/model.bin}"
header_flag="${NO_HEADER:-false}"

if test -f "$gensim_model"
then
  echo "Optimized gensim model found."
else
  echo "Optimized gensim model not found."
  if test -f "$custom_model"
  then
    echo "Custom vector file found!"
    echo "Generating gensim model..."
    python ./src/init_vectors.py "$custom_model" "$gensim_model" "$header_flag"
  else
    echo "No custom vector file provided. GloVe will be downloaded."
    echo "Downloading .zip with pretrained models..."
    curl -sS http://downloads.cs.stanford.edu/nlp/data/glove.6B.zip -o glove.zip
    echo "Download completed, preparing files..."
    if ! [ -d "models" ] ;then
      mkdir models
    fi
    unzip -o glove.zip -d models
    # Prepending model dimensions for gensim import
    # This is no longer required as of gensim 4.0
    # Keeping it just in case
    # sed -i '1s;^;400000 300\n;' models/glove.6B.300d.txt

    #Deleting the downloaded zipfile
    rm -f glove.zip
    custom_model="./models/glove.6B.300d.txt"
    # Initializing normed gensim model.
    # The headers need to be inferred, so I set the header flag to True
    python ./src/init_vectors.py "$custom_model" "$gensim_model" True
    echo "The optimized glove gensim model was created successfully."
  fi
fi

echo "Proceeding with deployment."

# preparing pipes for multithreading
server_start=/tmp/wv_server_start_pipe
unload_model=/tmp/wv_model_ram_pipe

# removing leftover pipes from previous runs
rm -f $server_start
rm -f $unload_model

# this should delete the pipes when exiting, but it does not always work
trap "rm -f $server_start" EXIT
trap "rm -f $unload_model" EXIT

# if the pipes do not exist create them
[ -p "$server_start" ] || mkfifo "$server_start" 
[ -p "$unload_model" ] || mkfifo "$unload_model"

# load the gensim model in memory as a detached process
python ./src/loader.py "$gensim_model" &

while true
do
    if read line <$server_start; then
        if [ "$line" = "START" ]; then
            break
        fi
        echo $line
    fi
done