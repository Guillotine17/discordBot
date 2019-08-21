# discordBot

make sure node is installed
### setup
1. make sure node is installed
2.  ```npm install```
3. populate `auth.json`
4. dont forget to `chmod +x bot.js`
### running
start command:
```node bot.js```


useful commands

copy service to systemd
```
sudo cp discordBot.service /etc/systemd/system/discordBot.service
```

service mgmt

```
sudo systemctl daemon-reload
sudo systemctl start discordBot
systemctl status discordBot.service


sudo systemctl stop discordBot
```

system logs
```
journalctl -u discordBot | tail -n 30
```

db stuff

