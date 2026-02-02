@echo off
SET BACKUP_DIR=C:\backups\nemy
SET DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
SET TIME=%time:~0,2%%time:~3,2%
SET FILENAME=nemy_backup_%DATE%_%TIME%.sql

mkdir %BACKUP_DIR% 2>nul

mysqldump -u root -p137920 nemy_db_local > %BACKUP_DIR%\%FILENAME%

forfiles /p %BACKUP_DIR% /m *.sql /d -7 /c "cmd /c del @path"

echo Backup completed: %FILENAME%
