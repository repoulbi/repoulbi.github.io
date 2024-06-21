document.addEventListener("DOMContentLoaded", function () {
  const navigationData = [
    // {
    //   label: "Dashboard",
    //   icon: "ri-home-line",
    //   link: "all_prodi_repo.html",
    // },
    // {
    //   label: "Menu Design",
    //   icon: "ri-menu-3-line",
    //   link: "#menu-design",
    //   children: [
    //     {
    //       label: "Horizontal menu",
    //       icon: "ri-git-commit-line",
    //       link: "horizontal-menu.html",
    //     },
    //     {
    //       label: "Horizontal Top Menu",
    //       icon: "ri-text-spacing",
    //       link: "horizontal-top-menu.html",
    //     },
    //     {
    //       label: "Two Sidebar",
    //       icon: "ri-indent-decrease",
    //       link: "two-sidebar.html",
    //     },
    //     {
    //       label: "Vertical block menu",
    //       icon: "ri-line-height",
    //       link: "vertical-top-menu.html",
    //     },
    //   ],
    // },
    // {
    //   label: "Social",
    //   icon: "ri-record-circle-line",
    //   link: "social.html",
    // },
    // Other menu items can be added here
  ];

  function generateSubMenu(subMenu) {
    return subMenu
      .map(
        (item) => `
            <li><a href="${item.link}" class="iq-waves-effect"><i class="${
          item.icon || ""
        }"></i><span>${item.label}</span></a></li>
        `
      )
      .join("");
  }

  function generateNavigation(data) {
    return data
      .map(
        (item) => `
            <li>
                <a href="${item.link}" class="iq-waves-effect ${
          item.children ? "collapsed" : ""
        }" ${
          item.children ? 'data-toggle="collapse" aria-expanded="false"' : ""
        }>
                    <i class="${item.icon}"></i><span>${item.label}</span>${
          item.children
            ? '<i class="ri-arrow-right-s-line iq-arrow-right"></i>'
            : ""
        }
                </a>
                ${
                  item.children
                    ? `<ul id="${item.link.replace(
                        "#",
                        ""
                      )}" class="iq-submenu collapse" data-parent="#iq-sidebar-toggle">
                    ${generateSubMenu(item.children)}
                </ul>`
                    : ""
                }
            </li>
        `
      )
      .join("");
  }

  const sidebarHTML = generateNavigation(navigationData);
  document.getElementById("iq-sidebar-toggle").innerHTML = sidebarHTML;
});
