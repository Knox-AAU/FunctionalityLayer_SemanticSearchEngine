For before dockerization is complete, will be updated later:
Only tested in linux, for windows users wsl recommended. Rip OSX users

Requirements:
- docker
- docker-compose
- node
- npm

Starting project:
- download and place localTempDB.csv in <projectRoot>/docker/
- Make sure docker is running. "systemctl start docker" on most systems.
- cd <projectRoot>/docker
- docker compose up -d  || or first time: docker-compose up --build -d   




if you specifically want to develop frontend only:
- npm i
- npm run server
- goto http://localhost:3000