FROM node:latest

RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
RUN /bin/bash -c 'source "$HOME/.cargo/env"'
RUN git clone https://github.com/iden3/circom.git /app/installation/circom
RUN /root/.cargo/bin/cargo build --release --manifest-path /app/installation/circom/Cargo.toml
RUN /root/.cargo/bin/cargo install --path /app/installation/circom/circom

#TODO: get rid of the redundant "circom" pfolder in the "installation" folder (above)
RUN git clone https://github.com/iden3/circomlib.git /app/circom/lib/circomlib
RUN npm install -g snarkjs@latest

COPY ./heimdalljs/package.json /app/heimdalljs/package.json
WORKDIR /app/heimdalljs

RUN npm i

RUN apt update
RUN apt upgrade -y
RUN apt install golang-go -y
ENV GO111MODULE=on

RUN go get github.com/msoap/shell2http@latest
RUN mkdir -p ~/bin/
RUN ln -s $(go env GOPATH)/bin/shell2http ~/bin/shell2http
ENV PATH=$PATH:/root/go/bin/

# https://github.com/msoap/shell2http
CMD ["shell2http","-form",\
 "GET:/upload/form", "echo \"<html><body><form method=POST action=/upload/file?name=$v_name enctype=multipart/form-data><input type=file name=uplfile><input type=submit></form>\"",\
 "POST:/upload/file", "cat $filepath_uplfile > $v_name; echo OK \"$v_name $filepath_uplfile\"",\
 "/heimdalljs/key/new", "heimdalljs key new $v_seed",\
 "/heimdalljs/key/pub", "echo \"$v_private\" | heimdalljs key pub",\
 "/heimdalljs/cred/new", "heimdalljs cred new --attributes $v_attributes --id $v_id --publicKey $v_publicKey --expiration $v_expiration --type $v_type --delegatable $v_delegatable --registry $v_registry --secretKey $v_secretKey --destination $v_destination ; cat $v_destination"\
 ]

COPY ./heimdalljs /app/heimdalljs
RUN npm link
RUN heimdalljs -h

COPY ./.git /app/.git