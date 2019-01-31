using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using MapConfig.Models;

namespace jncc_web_api.Pages.BaseLayers
{
    public class CreateModel : PageModel
    {
        private readonly MapConfig.Models.MapConfigContext _context;

        public CreateModel(MapConfig.Models.MapConfigContext context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public BaseLayer BaseLayer { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.BaseLayer.Add(BaseLayer);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}