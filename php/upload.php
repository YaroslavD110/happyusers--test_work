<?php

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        if ( move_uploaded_file( $_FILES['file']['tmp_name'], '../uploaded_images/' . $_FILES['file']['name'] ) ) {
            echo 'Файл "' . $_FILES['file']['name'] . '" завантажено!';
        } else {
            echo 'Файл "' . $_FILES['file']['name'] . '" не завантажено!!!';
        }
    }