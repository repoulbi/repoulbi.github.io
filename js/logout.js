document.addEventListener("DOMContentLoaded", function () {
    let logout = document.getElementById("logout");

    // Tambahkan event listener untuk mengarahkan saat elemen diklik
    logout.addEventListener("click", function (event) {
        event.preventDefault(); // Mencegah perilaku default tautan

        Swal.fire({
            title: "Apakah anda sudah yakin?",
            text: "Anda akan logout dari sistem",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Logout",
        }).then((result) => {
            if (result.isConfirmed) {
                document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "usraes=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "https://euis.ulbi.ac.id/";
            }
        });
    });
});