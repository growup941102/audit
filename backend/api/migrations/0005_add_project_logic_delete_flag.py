from django.db import migrations


def _table_exists(connection, table_name):
    return table_name in set(connection.introspection.table_names())


def _column_exists(connection, table_name, column_name):
    with connection.cursor() as cursor:
        columns = connection.introspection.get_table_description(cursor, table_name)
    return any(getattr(column, 'name', column[0]) == column_name for column in (columns or []))


def _add_project_logic_delete_flag(apps, schema_editor):
    del apps
    connection = schema_editor.connection
    table_name = 'c_r_cm_project'

    if not _table_exists(connection, table_name):
        return

    with connection.cursor() as cursor:
        if not _column_exists(connection, table_name, 'is_deleted'):
            cursor.execute(
                "ALTER TABLE c_r_cm_project "
                "ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 "
                "COMMENT 'logical delete flag: 0 valid, 1 deleted'"
            )

        if _column_exists(connection, table_name, 'industry'):
            cursor.execute(
                "UPDATE c_r_cm_project "
                "SET is_deleted = CASE "
                "WHEN industry IS NULL OR TRIM(industry) = '' THEN 1 "
                "ELSE 0 "
                "END"
            )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_websitesetting_watermark_enabled_default'),
    ]

    operations = [
        migrations.RunPython(_add_project_logic_delete_flag, migrations.RunPython.noop),
    ]
