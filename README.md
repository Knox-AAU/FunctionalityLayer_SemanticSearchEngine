For before dockerization is complete, will be updated later:
Only tested in linux, for windows users wsl recommended. Rip OSX users

Requirements:
- docker
- docker-compose

Starting project:
1. download and place localTempDB.csv in <projectRoot>/docker/ alternatively follow step 1a
    1a. in <projectRoot>/docker/init.sql and comment out(or delete) lines: 1-9 and 25
2. Make sure docker is running. "systemctl start docker" on linux systems with systemd.
3. Open a terminal
4. "cd <projectRoot>/docker"
5. "docker compose up -d"
6. Navigate to localhost:8080 in your preferred standard browser

If you make any changes to the code and you want to run it in docker run the following from the <projectRoot>/docker 
- docker compose up --build -d



if you specifically want to develop frontend only(This requires node and npm to be installed on your system):
- npm i
- npm run server
- goto http://localhost:3000
