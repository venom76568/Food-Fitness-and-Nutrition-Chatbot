# Sample Makefile
CC = gcc
CFLAGS = -Wall -g

all: run

run: main.c
    $(CC) $(CFLAGS) -o run main.c

clean:
    rm -f run
