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

# RUN wget http://rogue.rogueforge.net/files/rogue5.4/rogue5.4.4-src.tar.gz
RUN curl -L -O http://pkgs.fedoraproject.org/repo/pkgs/rogue/rogue5.4.4-src.tar.gz/033288f46444b06814c81ea69d96e075/rogue5.4.4-src.tar.gz && \
    tar -xzf rogue5.4.4-src.tar.gz && \
    cd rogue5.4.4 && \
    ./configure --disable-debug --disable-dependency-tracking && \
    make install

# VOLUME ["/root/"]

ENTRYPOINT ["sh", "-c", "if [ -f root/rogue.save ]; then rogue root/rogue.save; else rogue; fi"]
