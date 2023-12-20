<h1 align="center">
  <br>
  <a href="https://github.com/Knox-AAU/FunctionalityLayer_SemanticSearchEngine">
  <br>
    Functionality Layer - Semantic Search Engine
  <br>
</h1>

<p align="center">
  <a href="#installation-and-first-run">Installation and first run</a> •
  <a href="#usage">Usage</a> •
  <a href="#authors">Authors</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>


## Installation and first run
This guide assumes you are running Arch linux or a similar OS, although any docker-compose capable X86 system should be able to run it. No guarantees though
Clone this github repo:
```bash
$ git clone https://github.com/Knox-AAU/FunctionalityLayer_SemanticSearchEngine
```
Make sure docker is running. For Systemd systems:
```bash
$ systemctl start docker
```
Change to the docker directory:
```bash
$ cd docker
```
Run docker-compose:
```bash
$ docker-compose up -d
```
Note: This WILL take a while the first time.
Note2: This command will not respect any changes to the files after it has been run once, to rebuild with any changes add the `--build` flag to the command

When the previous command has finished executing the node container starts compiling the react web app, this will take a while and if patience is not one of your virtues: To monitor this(not necessary):
```bash
$ docker-compose up node
```
Note: If node finishes compiling the web app, nothing will be printed after "Attaching to semanticNode" if this is the case you can continue. If not the message: `Server running at http://0.0.0.0:80/` will eventually be printed. Now the app and server is ready, continue to next step.
Note2: The terminal is now attached to the docker container and closing it or terminating the command will stop the container

You can now navigate to localhost:8080 where the webapp should be running. 

## Usage
If you haven't followed the instructions in [Installation and first run](#installation-and-first-run) and see the web app, DO!!!

At the very top-left a very-difficult-to-see button that says `admin` on it is present. Press this and you will be redirected to the admin page.
Here you can add wikipedia links to the database(comes empty). Example of valid Wikipedia link: `https://en.wikipedia.org/wiki/Barack_Obama` Add a couple by pasting a link into the input field and press `add to DB`.
The button will disappear and if it reappears without any pop-ups(alerts) the link was added successfully, otherwise..... RIP
There is also another button: `Reset`. This button, contrary to popular belief, reloads the database and re-pre-processes the entire database so it's ready for searching. Unfortunately there is no indication when this is done without having a terminal attached to the docker container "ranking"(make sure your terminal is in the docker container):
```bash
$ docker-compose up ranking
```
Note: The pre-processing is done when the message: `INFO:shared_utils:Documents: Done Processing and ready for requests` appears

Back on the main page there are two sections:
    - The chatbot bar(Doesn't work)
    - The search bar
The searchbar works as you would expect but has two search buttons
    - Search
    - No LlamaSearch
The second button was added as Llama is painfully slow(5+ minutes) on the servers the original group had access to and doesn't seem to benefit the search(Based on personal experience)
The advanced button does not work

Have FUN

## Authors

-  [Thomas Nykjær](https://github.com/ThomasNyk)

## Credits

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/)
- [Transformers](https://pypi.org/project/transformers/)
- [PyTorch](https://pytorch.org/)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Python](https://www.python.org/)
- [psycopg2](https://pypi.org/project/psycopg2/)
- [NumPy](https://numpy.org/)
- [PG](https://www.npmjs.com/package/pg)
- [TailwindCSS](https://tailwindcss.com/)
- [Wikipedia](https://www.wikipedia.org/)

## License

MIT

---

