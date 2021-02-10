if test -f ./models/glove.6B.50d.txt
then
  echo "Glove model found."
else
  echo "Glove model not found!"
  echo "Downloading .zip with pretrained models..."
  curl -sS http://downloads.cs.stanford.edu/nlp/data/glove.6B.zip -o glove.zip
  echo "Download completed, preparing files..."
  mkdir models
  unzip glove.zip -d models
  #Prepending model dimensions for gensim import
  echo "Prepending dims to glove.6B.50d.txt..."
  sed -i '1s;^;400000 50\n;' models/glove.6B.50d.txt
  echo "Prepending dims to glove.6B.100d.txt..."
  sed -i '1s;^;400000 100\n;' models/glove.6B.100d.txt
  echo "Prepending dims to glove.6B.200d.txt..."
  sed -i '1s;^;400000 200\n;' models/glove.6B.200d.txt
  echo "Prepending dims to glove.6B.300d.txt..."
  sed -i '1s;^;400000 300\n;' models/glove.6B.300d.txt
  rm -f glove.zip
  echo "The Glove model is ready."
fi

echo "Proceeding with deployment..."
