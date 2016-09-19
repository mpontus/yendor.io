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

# Copy custom files
# COPY files/* /files/

# Install the game
RUN curl -L -O "http://downloads.sourceforge.net/project/nethack/nethack/3.6.0/nethack-360-src.tgz" && \
    tar -xzf "nethack-360-src.tgz" && \
    cd "nethack-3.6.0/" && \
    # cp /files/nethack-3.6.0-hint-tty hint && \
    # sys/unix/setup.sh  && \
    cd sys/unix && \
    ./setup.sh hints/linux && \
    cd ../.. && \
    make all && \
    make install

# VOLUME ["/root/nh/install/games/lib/nethackdir/save/"]

ENTRYPOINT ["/root/nh/install/games/nethack", "-u", "anonymous"]
