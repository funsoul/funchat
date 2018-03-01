<?php

function packData($data) {
    return json_encode($data);
}

function unpackData($data) {
    if(isset($data) && !empty($data)) {
        return json_decode($data,true);
    }else{
        return [];
    }
}

function dd($prefix = '', $data) {
    if(isset($prefix)) {
        echo $prefix.chr(10);
    }
    if(is_array($data)) {
        var_export($data);
    }else{
        var_dump($data);
    }
}