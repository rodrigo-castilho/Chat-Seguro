
let currentUser = $('#username').text();
let csrfToken = $('meta[name="csrf-token"]').attr('content');
let messagePollingInterval;


const encryptionKey = 'demo-key-1234567890abcdef1234567890abcdef'; 


function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' · ' + date.toLocaleDateString();
}

function createMessageElement(messageData) {
    const isSent = messageData.sender === currentUser;
    const messageClass = isSent ? 'sent' : 'received';
    
    return `
        <div class="d-flex flex-column ${isSent ? 'align-items-end' : 'align-items-start'}">
            <div class="message-card p-3 ${messageClass}">
                <div class="user-badge mb-1">
                    ${messageData.sender} ${isSent ? '<i class="fas fa-check-double"></i>' : ''}
                </div>
                <div class="message-text mb-1">${messageData.message}</div>
                <div class="message-time">
                    ${formatDateTime(messageData.timestamp)}
                </div>
            </div>
        </div>
    `;
}

function loadMessages() {
    $.get('/get_messages', function(data) {
        if (data.messages && data.messages.length > 0) {
            $('#noMessages').hide();
            
            
            $('#messageArea').children().not('[id^="temp-"]').remove();
            
            data.messages.forEach(msg => {
                const messageElement = createMessageElement(msg);
                $('#messageArea').append(messageElement);
            });
            
            
            const messageArea = document.getElementById('messageArea');
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    }).fail(function() {
        console.error('Erro ao carregar mensagens');
    });
}


function sendMessage() {
    const messageText = $('#messageInput').val().trim();
    if (messageText === '') return;

    
    const tempId = 'temp-' + Date.now();
    const tempMessage = {
        sender: currentUser,
        message: messageText,
        timestamp: new Date().toISOString()
    };
    
    $('#noMessages').hide();
    $('#messageArea').append(`<div id="${tempId}">${createMessageElement(tempMessage)}</div>`);
    $('#messageInput').val('');
    
    
    const messageArea = document.getElementById('messageArea');
    messageArea.scrollTop = messageArea.scrollHeight;
    
    
    $.ajax({
        url: '/send_message',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            message: messageText,
            timestamp: tempMessage.timestamp,
            _csrf_token: csrfToken
        }),
        success: function() {
            $(`#${tempId}`).remove();
            loadMessages();
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON?.message || 'Erro desconhecido';
            $(`#${tempId} .message-text`).append(` <i class="fas fa-exclamation-triangle text-danger" title="Falha no envio: ${errorMsg}"></i>`);
        }
    });
}


$(document).ready(function() {
    
    $.ajaxSetup({
        headers: {
            'X-CSRFToken': csrfToken
        }
    });
    
    
    loadMessages();
    messagePollingInterval = setInterval(loadMessages, 2000);
    
    
    $('#sendButton').click(sendMessage);
    
    
    $('#messageInput').keypress(function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    
    $(window).on('beforeunload', function() {
        clearInterval(messagePollingInterval);
    });

    
$('#toggleCsrfTest').click(function() {
    $('#csrf-test-container').toggle();
    $(this).html(function(_, html) {
        return html.includes('Mostrar') ? 
            '<i class="fas fa-lock"></i> Ocultar Testes CSRF' : 
            '<i class="fas fa-lock"></i> Mostrar Testes CSRF';
    });
});


$('#testCsrfFail').click(function() {
    $.ajax({
        url: '/send_message',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            message: "Mensagem maliciosa (sem token CSRF)",
            timestamp: new Date().toISOString()
        }),
        success: function() {
            $('#csrfTestResult').removeClass('alert-info').addClass('alert-danger')
                .html('<i class="fas fa-times-circle"></i> <strong>FALHA NA PROTEÇÃO!</strong> O servidor aceitou uma requisição sem token CSRF!');
        },
        error: function(xhr) {
            if(xhr.status === 403) {
                $('#csrfTestResult').removeClass('alert-info').addClass('alert-success')
                    .html('<i class="fas fa-check-circle"></i> <strong>PROTEÇÃO ATIVA!</strong> O servidor bloqueou a requisição sem token (Status 403).');
            }
        }
    });
});


$('#testCsrfSuccess').click(function() {
    $.ajax({
        url: '/send_message',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            message: "Mensagem legítima (com token CSRF)",
            timestamp: new Date().toISOString(),
            _csrf_token: csrfToken
        }),
        success: function() {
            $('#csrfTestResult').removeClass('alert-info').addClass('alert-success')
                .html('<i class="fas fa-check-circle"></i> <strong>SUCESSO!</strong> Mensagem legítima foi aceita (com token CSRF válido).');
            loadMessages(); 
        },
        error: function() {
            $('#csrfTestResult').removeClass('alert-info').addClass('alert-danger')
                .html('<i class="fas fa-times-circle"></i> <strong>ERRO!</strong> O servidor rejeitou uma requisição válida!');
        }
    });
});
});