COMMAND=docker-compose

all: run

run:
	$(COMMAND) up --build

destroy:
	$(COMMAND) down --rmi all -v

clean:
	bash clean.sh