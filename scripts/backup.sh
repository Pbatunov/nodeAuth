#!/usr/bin/env bash
# Бэкап БД и аватарок для docker-compose стека.
# Запуск на сервере из каталога проекта: ./scripts/backup.sh
# Хранит копии за BACKUP_KEEP_DAYS дней (по умолчанию 7).
# Копии лежат на том же сервере: для защиты от потери сервера скопируйте их наружу.
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/nodeAuth}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/chat}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-chat_uploads}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"

cd "$PROJECT_DIR"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

stamp="$(date +%Y%m%d-%H%M%S)"
db_file="$BACKUP_DIR/db-$stamp.sql.gz"
uploads_file="$BACKUP_DIR/uploads-$stamp.tar.gz"

# Дамп БД: пароль передаём через MYSQL_PWD внутри контейнера, а не в аргументах командной строки.
docker compose exec -T db sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump --single-transaction --routines -uroot "$MYSQL_DATABASE"' \
  | gzip > "$db_file"

# Аватарки из volume uploads (только чтение).
docker run --rm -v "$UPLOADS_VOLUME:/data:ro" alpine tar czf - -C /data . > "$uploads_file"

# Проверка, что архивы не пустые и корректно сжаты.
gzip -t "$db_file"
gzip -t "$uploads_file"

chmod 600 "$db_file" "$uploads_file"

# Удаляем копии старше KEEP_DAYS дней.
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

echo "backup ok: $db_file ($(du -h "$db_file" | cut -f1)), $uploads_file ($(du -h "$uploads_file" | cut -f1))"
