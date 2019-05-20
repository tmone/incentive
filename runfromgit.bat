git diff --name-only > list.txt
del -y packed.rar
FOR /F %%G IN (list.txt) DO rar a -r packed.rar %%G