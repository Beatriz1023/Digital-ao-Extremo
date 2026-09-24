function openTab(evt, tabId) {

    // Esconde todas as abas
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    // Remove o active das opções do menu
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    // Mostra a aba escolhida
    document.getElementById(tabId).classList.add("active");

    // Marca a opção do menu como ativa
    if (evt && evt.currentTarget.classList.contains("tab")) {
        evt.currentTarget.classList.add("active");
    }
}
```
