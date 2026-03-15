bash
sudo systemctl start docker
(Opcional) Si quieres que Docker se inicie automáticamente cada vez que enciendas la computadora, también puedes ejecutar:

bash
sudo systemctl enable docker
Una vez que hayas iniciado el servicio con el primer comando, vuelve a intentar ejecutar tu aplicación con:

bash
docker-compose up -d --build
Nota: Si después de iniciar el servicio te da un error de permisos (algo como permission denied while trying to connect to the Docker daemon socket), tendrás que ejecutar docker-compose con sudo:

bash
sudo docker-compose up -d --build