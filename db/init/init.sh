mongo -- "$DB_NAME" <<EOF
    var user = '$DB_USER';
    var passwd = '$DB_PASSWORD';
    db.createUser({user: user, pwd: passwd, roles: ["readWrite"]});
EOF