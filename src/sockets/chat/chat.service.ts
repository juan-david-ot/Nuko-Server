async function handleMessage(message: { text: string }) {
    // guardar en supabase
    // validar
    return {
        text: message.text
    }
}

export {
    handleMessage
}
