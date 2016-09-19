FROM ubuntu

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
        curl \
        autoconf \
        make \
        bison \
        flex \
        groff \
        bsdmainutils \
        ncurses-dev && \
    apt-get clean

RUN apt-get install -y bzip2

RUN curl -L -O "https://sites.google.com/site/broguegame/brogue-1.7.4-linux-amd64.tbz2" && \
    tar -xjf "brogue-1.7.4-linux-amd64.tbz2" && \
    cd "brogue-1.7.4" && \
    make curses && \
    cp bin/brogue /usr/bin/

# VOLUME ["/root/"]

# ENTRYPOINT ["sh", "-c", "cd /save && TERM=xterm-256color brogue"]

ENTRYPOINT ["sh", "-c", "cd /root && brogue"]
