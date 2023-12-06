# FunctionalityLayer_SearchEngine

Repository for Search Engine - Group F

# Authors:

Anders Nielsen: anieli21@student.aau.dk

Jacob Gram Højris: jhojri21@student.aau.dk

Marcus Andersen: Lau marla21@student.aau.dk

Mattias Aagaard Pedersen: mape17@student.aau.dk

Thomas Dam Nykjær: tnykja21@student.aau.dk

Tobias Berg: tber21@student.aau.dk

For before dockerization is complete, will be updated later:
Only tested in linux, for windows users wsl recommended. Rip OSX users

Requirements:

- docker
- docker-compose
- node
- npm

Starting project:

- Make sure docker is running. "systemctl start docker" on most systems.
- cd <projectRoot>/docker
- docker compose up -d
- npm i
- npm run server
- goto http://localhost:3000

# BERT:

For BERT to work, you need to install torch running the following command in a command prompt window: 'pip install torch'. Then copy the "torch" and "torch-xxx.dist-info" folder to virtualenv\Lib\site-packages. These can be found in C:\Python310\Lib\site-packages

# Word2Vec:

For Word2Vec to work, you need to download the pretrained model from this url: https://drive.google.com/file/d/0B7XkCwpI5KDYNlNUTTlSS21pQmM/edit?resourcekey=0-wjGZdNAUop6WykTtMip30g and place it in the gensim folder virtualenv\Lib\site-packages\gensim\models
