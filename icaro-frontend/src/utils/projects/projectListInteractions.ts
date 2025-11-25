export function initProjectListInteractions() {

  const projectCards = document.querySelectorAll<HTMLElement>('.project-card[data-expandable="true"]');
  
  projectCards.forEach((card) => {
    card.addEventListener('click', function(e: Event) {
      const target = e.target as HTMLElement;

      if (target.tagName === 'A' || target.closest('a') || 
          target.closest('.edit-btn') || target.closest('.delete-btn')) {
        return;
      }
      
      const projectId = this.getAttribute('data-project-id');
      if (projectId) {
        const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
        projectCard?.classList.toggle('expanded');
      }
    });
  });

  // 3. Botones explícitos de expansión
  const expandButtons = document.querySelectorAll<HTMLElement>(".expand-btn");
  expandButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); 
      const projectId = this.getAttribute("data-project-id");
      if (projectId) {
        const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
        projectCard?.classList.toggle("expanded");
      }
    });
  });
  
  console.log("✅ [PROJECTS] List interactions initialized");
}