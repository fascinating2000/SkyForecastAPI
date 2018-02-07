# Deploying project to AWS EC2 (AMI)

## AWS EC2 Environment setup

### Prerequiste

To ensure that all of your software packages are up to date, perform a quick software update on your instance. This process may take a few minutes, but it is important to make sure that you have the latest security updates and bug fixes.

The -y option installs the updates without asking for confirmation. If you would like to examine the updates before installing, you can omit this option.

```bash
sudo yum update -y
```

### Node Install

1. Connect to your Linux instance as ec2-user using SSH.
2. Install the current version of node version manager (nvm) by typing the following at the command line to install version 33.6.
    ```bash
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
    ```
    We will use nvm to install Node.js because nvm can install multiple versions of Node.js and allow you to switch between them. See the nvm repo on GitHub for the current version to install.
3. Activate nvm by typing the following at the command line.
    ```bash
    . ~/.nvm/nvm.sh
    ```
4. Use nvm to install the version of Node.js you intend to use by typing the following at the command line.
    ```bash
    nvm install X.X.X (or stable)
    ```
    Installing Node.js also installs the Node Package Manager (npm) so you can install additional modules as needed.

5. Test that Node.js is installed and running correctly by typing the following at the command line.
    ```bash
    node -e "console.log('Running Node.js ' + process.version)"
    ```
    This should display the following message that confirms the installed version of Node.js running.
    ```
    Running Node.js vX.X.X
    ```

### MongoDB install

1. Add a MongoDB yum repository for a 64-bit RPM
    ```bash
    sudo vi /etc/yum.repos.d/10gen.repo
    ```
    Add following texts
    ```text
    [10gen]
    name=10gen Repository
    baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64
    gpgcheck=0
    ```
2. Install mongodb
    ```bash
    sudo yum install mongo-10gen and mongo-10gen-server
    ```
3. Setup the data directory
    ```bash
    sudo mkdir -p /data/db/
    ```

### Git Install
```bash
sudo yum install git
```

### Apache Install
```bash
sudo yum install -y httpd24
```

## Project Environment

### Cloning git repo & node package install

```bash
cd /var/www/html
git clone https://github.com/skyweb331/SkyForecastAPI.git
cd SkyForecastAPI && npm i
```

*If you are trying to clone with ssh, you need to add your ssh keys to your agent and github account*

### Env variables configuration
First copy sample env file and then input proper tokens
```bash
cp .env.example .env
```
*You need `GOOGLE_KEY`, `DARKSKY_KEY` and project-specific `JWT_SECRET`*

*For Darksky service, refer [Darksky Doc](https://darksky.net/dev/docs)*

## Running project

1. Run mongo server
    You can start,stop, restart mongo db by following commands
    ```bash
    sudo service mongod start/stop/restart
    ```
2. Run project
    ```bash
    npm run prod
    ```
    *Project is running on 8080 port so you should open 8080 port in EC2 security rules*

### Running project in background

Project will stop running if we lost connection or quit ssh. To keep project running forever, you can use several packages like `Forever`, `pm2` etc.

#### Example with `Forever`

1. Install `Forever`
    ```bash
    npm i -g forever
    ```
2. Run project using forever
    ```bash
    forever start --uid skyforcast --append -c "npm run prod" .
    ```
3. Check project is running correctly by following command
    ```bash
    forever list
    ```

### Proxify port
For now, project is running on 8080 port so you should specify port number in url to access. Using Apache, you can proxify 8080 to 80, so that you can access without specifying port.

1. Apache conf file update
    Create a file and open editor
    ```bash
    sudo nano /etc/httpd/conf.d/skyforecast.conf
    ```
    Now add this apache conf
    ```bash
    ProxyPass / http://localhost:8080
    ```
2. Apache server start/stop/restart
    ```bash
    sudo service httpd start/stop/restart
    ```
