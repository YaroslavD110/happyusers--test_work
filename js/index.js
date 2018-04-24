(function() {
    // --- main DOMs elements
    const input         = document.getElementById('form_input');
    const dropField     = document.getElementById('drop-field');
    const dragCover     = document.getElementById('drag-cover');
    const dragContainer = document.getElementById('drag-container');
    const form          = document.getElementById('main-form');
    const thumbnails    = document.getElementById('thumbnails');

    // --- images array
    let images = [];

    // --- allowed formats array
    const formats = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];

    // --- form button
    const button = document.createElement('button');

    // --- prevent default actions
    addEventListenerToMany( dragContainer, ['dragenter', 'dragover', 'dragleave', 'drop'], e => {
        e.preventDefault();
    });

    button.addEventListener( 'click', e => {
        e.preventDefault();
    }, false);

    // --- drag animation
    addEventListenerToMany( dropField, ['dragover', 'dragenter'], e => {
        dropField.classList.add( 'dragedover_container' );
    });

    addEventListenerToMany( dragCover, ['dragleave', 'drop'], e => {
        dropField.classList.remove( 'dragedover_container' );
    });

    // --- catch files
    dropField.addEventListener( 'drop', e => {
        handleFiles( e.dataTransfer.files );
    }, false);

    input.addEventListener( 'change', e => {
        handleFiles( e.srcElement.files );
    }, false);

    // --- refresh page
    function refreshPage() {
        images = [];
        [...document.getElementsByClassName('thumbnail_block')].forEach( el => el.remove() );
        refreshArrayState();
    }

    // --- add to all images
    function handleFiles( files ) {
        [...files].forEach( file => {
            if( checkExtension( file.name ) )
                renderThumbnails( file );
            else
                notify(`File "${ file.name }" have wrong extension!`, true);
        });
    }

    // --- remove images
    function removeImage() {
        let imgId = parseInt( this );

        images = images.filter( img => img.lastModified !== imgId );
        refreshArrayState();

        [...document.getElementsByClassName('thumbnail_block')].forEach( el => {
            if( el.children[0].dataset.id == imgId )
                el.remove();
        });
    }

    // --- icons
    const closeIcon  = `<svg class="close_icon" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
    const loaderIcon = `<svg class="loader_icon" fill="#000000" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;

    // --- add thumbnail to gallery
    function renderThumbnails( file ) {
        const div    = document.createElement('div');
        const reader = new FileReader();

        reader.readAsDataURL( file );

        reader.onloadstart = () => {
            div.className = 'thumbnail_block';
            div.innerHTML = `
                ${ loaderIcon }
            `;

            thumbnails.appendChild( div );
        };

        reader.onloadend = () => {
            let imgId = file.lastModified;

            div.innerHTML = `
                <img src="${ reader.result }" data-id="${ imgId }" />
                ${ closeIcon }
            `;

            div.children[1].addEventListener( 'click', removeImage.bind( imgId ), false );

            images.push( file );
            refreshArrayState();
        };
    }

    // --- refreshing images array
    function refreshArrayState() {
        if( images.length > 0 ) {
            button.id = 'form_btn';
            button.innerText = 'Upload';

            form.appendChild( button );
            dropField.style.paddingBottom = '60px';
        } else {
            document.getElementById( 'form_btn' ).remove();
            dropField.style.paddingBottom = '0';
        }
    }

    // --- upload files
    button.addEventListener( 'click', e => {
        images.forEach( image => uploadFile( image ) );
        refreshPage();
    });

    function uploadFile( file ) {
        const url = '/php/upload.php';
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        xhr.open( 'POST', url, true );

        xhr.addEventListener( 'readystatechange', e => {
            if ( xhr.readyState == 4 && xhr.status == 200 ) {
                notify('All images were uploaded successful!', false);
            } else if ( xhr.readyState == 4 && xhr.status != 200 ) {
                notify('Something is wrong, images were not uploaded!', true);
            }
        });

        formData.append( 'file', file );
        xhr.send( formData );
    }

    // --- checking name for correctness
    function checkExtension( name ) {
        const reg = '([A-Za-z0-9-_=%!@#№]+.jpg)';
        const ext = name.split('.').pop();
        let trigger = false;

        formats.forEach( format => {
            if( format.toLowerCase() === ext.toLowerCase() )
                trigger = true;
        });

        return trigger;
    }

    // --- additional methods
    function addEventListenerToMany( el, array, func ) {
        array.forEach( eventName => {
            el.addEventListener( eventName, func, false );
        });
    }

    function notify( text, isError ) {
        let container = document.createElement('div');

        container.className = isError ? 'notify_dangerous' : 'notify_success';
        container.id = 'notify_container';
        container.innerHTML = `
            <h3 class="notify_text">${ text }</h3>  
        `;

        dragContainer.appendChild( container );

        setTimeout( function() {
            container.style.opacity = '1';
        }, 300);

        setTimeout( function() {
            container.style.opacity = '0';

            setTimeout( function() {
                document.getElementById('notify_container').remove();
            }, 300);
        }, 3000);
    }
})();
