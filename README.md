#SummaryEval
Complete server architechture for a framework for the evaluation of L2 summaries.

Current server structure:
 - front-end: Angular front-end
 - computation: Python3 FastAPI server (served on port 8080)

##First setup
The server runs entirely on Docker architecture.
Clone the repo and run `docker-compose build`.
Once build is complete you can run `docker-compose up` to bring the servers up.
The angular development server will be served on `localhost:5000` and the computation server will be served on `./localhost:8080`.
You can test the production nginx server on your machine by changing `target: dev` to `target: prod` inside `docker-compose.yml`. Make sure to rebuild and relaunch your servers.

Follow the instructions in [Deployement](##Deployement) when deploying the project to a production server.

##Deployement
When cloning the repo to a deployement server make sure to change `target: dev` to `target: prod` inside `./docker-compose.yml`.
You can then build the server just like on your machine via `docker-compose build`.
In production you can detach the instances of your docker containers from your ssh session by running `docker-compose up -d`. This will ensure that the servers will run when you exit your ssh session.

Since you will most likely be deploying your server via git, you will have to edit `./docker-compose.yml` every time you pull changes from your repo.
You can avoid this by building and running the server by running the commands from `./production/`. The production docker-compose configuration file assumes that you will enable HTTPS support, so you will have to setup certbot by following the instructions in the [following section](##HTTPS-support-on-a-development-server).

##HTTPS support on a development server
In order to enable HTTPS support, you will first need to deploy the project on a server that is open to the web (associated to a domain).
Build it and run it once by editing `./docker-compose.yml` to make sure that everything is working.

To run nginx with ssl support we need to run a certbot image and request a certificate from letsencrypt. There is a nice shell script (thank you [Philipp](https://github.com/wmnnd)) that will do this autmatically, but you need to personalise it first.
Cd into `./production/` and run `cp init-letsencrypt.sh.example init-letsencrypt.sh` to copy the provided example configuration file. While you are at it, make it executable with `chmod +x init-letsencrypt.sh`.
Now edit `init-letsencrypt.sh` by replacing `example.com` with your domain name. Also insert your email in the corresponding field.

Next, do the same for the nginx configuration file.
Run `cp ./nginx/nginx.config.example ./nginx/nginx.config` and edit the newly created file by substituing `example.com` with your domain name in both servers.

Both `./production/init-letsencrypt.sh` and `./production/nginx/nginx.config.example` are mentioned in `.gitignore`, so you will have to do this setup only once.

Now that you have prepared the files, you need to request your certificates from the EFF. Run `sudo ./init-letsencrypt.ssh` and wait for it to finish.
If everything goes well, you can now run `docker-compose build` and `docker-compose up -d` from the `./production` folder to bring up the servers.
