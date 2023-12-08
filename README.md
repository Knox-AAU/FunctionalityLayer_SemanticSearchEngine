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