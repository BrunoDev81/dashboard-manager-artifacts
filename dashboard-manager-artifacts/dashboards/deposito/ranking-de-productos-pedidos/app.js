const status = document.getElementById("status");

if (window.DashboardManager) {
  status.textContent = "Base conectada a Dashboard Manager. Configurá los datos autorizados para continuar.";
  status.classList.add("ready");
} else {
  status.textContent = "La integración con Dashboard Manager no está disponible en esta vista.";
}
