using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MapConfig.Models;

namespace JNCCMapConfigEditor.Pages.MapConfigItem
{
    public class DeleteModel : PageModel
    {
        private readonly MapConfig.Models.MapConfigContext _context;

        public DeleteModel(MapConfig.Models.MapConfigContext context)
        {
            _context = context;
        }

        [BindProperty]
        public MapConfig.Models.MapConfigItem MapConfigItem { get; set; }

        public async Task<IActionResult> OnGetAsync(long? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            MapConfigItem = await _context.MapConfigItem
                .Include(m => m.MapItem).FirstOrDefaultAsync(m => m.MapConfigId == id);

            if (MapConfigItem == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(long? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            MapConfigItem = await _context.MapConfigItem.FindAsync(id);

            if (MapConfigItem != null)
            {
                _context.MapConfigItem.Remove(MapConfigItem);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}