
from node:16

workdir /opt/zokb-parser/
copy . .

run npm install
run rm package.json package-lock.json navod.txt

