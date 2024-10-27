# OpenFest Timer

## Deployment

### Configuration

Configuration is done by environmental variables:

```yaml
HALLS: "/hall-a:Hall A;/hall-b:Hall B"
TITLE: "Hall A"  # not in use if HALLS is set to non-empty
PREFIX: /hall-a  # not in use if HALLS is set to non-empty
BASIC_AUTH: "admin:password"  # user:plaintext-password
```

### Prod Deployment

```sh
cd timer-repo/
git pull
podman build -t timer .

cat > .config/containers/systemd/timer.container <<EOF
[Container]
ContainerName=timer
Image=timer:latest

Environment=PORT=5050
Environment=HALLS="/hall-a:Hall A;/hall-b:Hall B;/test-hall:TEST"
Environment=BASIC_AUTH="user:password"

PublishPort=127.0.0.1:5050:5050

Network=INSERT_THE_NETWORK

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user restart timer
```

### Local Development

`docker-compose up --build`

## Based on Defcon

### Defcon

Defcon is a stopwatch running on Node.js, Express.js, and Socket.io.
It is intended to be a good starting point if you're just learning to use
web sockets. It currently uses xhr-polling so it is compatible with Heroku.

### Who's it for?

I originally wrote Defcon over four blog posts introducing Socket.io and
deploying to Heroku. Please checkout the posts on my site, [robdodson.me](http://robdodson.me)

- [Part 1](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Part 2](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/)
- [Part 3](http://robdodson.me/blog/2012/06/06/building-a-countdown-timer-with-socket-dot-io-pt-2/)
- [Part 4](http://robdodson.me/blog/2012/06/07/building-a-countdown-timer-with-socket-dot-io-pt-3/)

