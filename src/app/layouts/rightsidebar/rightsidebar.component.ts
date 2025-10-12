import { Component, Output, EventEmitter, Renderer2 } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { Store } from '@ngrx/store';
import { RootReducerState } from 'src/app/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { getLayout, getLayoutTheme, getLayoutWidth, getLayoutmode, getPosition, getPreloader, getSidebarcolor, getSidebarsize, getTopbar, getsidebarimage, getsidebarview } from 'src/app/store/layouts/layout-selector';
import { changeMode, changeTheme, changelayoutTheme, changeposition, changepreLoader, changesidebarImage, changesidebarView, changesidebarcolor, changesize, changetopbar, changewidthLayout } from 'src/app/store/layouts/layout-action';
import { LayoutState, initialState } from 'src/app/store/layouts/layout-reducers';
import { MENU } from '../sidebar/menu';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss'],
})
export class RightsidebarComponent {

  rightsidebar: any;
  attribute: any;
  grd: any;
  layout!: string;;
  layoutTheme: any;
  layoutmode: any;
  layoutposition: any;
  sidebarsize: any;
  sidebarViews: any;
  topbar: any;
  sidebarcolor: any;
  sidebarimage: any;
  preloader: any
  layoutWidth: any;
  initialAppState!: LayoutState;
  menuItems: any;
  @Output() settingsButtonClicked = new EventEmitter();

  constructor(private eventService: EventService,
    public store: Store<RootReducerState>,
    private spinner: NgxSpinnerService,
    public renderer: Renderer2) { }

  ngOnInit(): void {
    this.menuItems = MENU;
    this.initialAppState = initialState;
    
    this.store.select('layout').subscribe((data: any) => {
      this.layout = data.LAYOUT;
      this.layoutTheme = data.LAYOUT_THEME;
      this.layoutWidth = data.LAYOUT_WIDTH;
      this.layoutmode = data.LAYOUT_MODE;
      this.layoutposition = data.LAYOUT_POSITION;
      this.topbar = data.TOPBAR;
      this.sidebarsize = data.SIDEBAR_SIZE;
      this.sidebarViews = data.SIDEBAR_VIEW;
      this.sidebarcolor = data.SIDEBAR_COLOR;
      this.sidebarimage = data.SIDEBAR_IMAGE;
      this.preloader = data.DATA_PRELOADER;
    })
  }

  //  Filter Offcanvas Set
  openEnd() {
    document.querySelector('.righsidebar')?.classList.add('show')
    document.querySelector('.backdrop2')?.classList.add('show')

    setTimeout(() => {
      this.attribute = document.documentElement.getAttribute('data-layout')
      if (this.attribute == 'vertical') {
        var vertical = document.getElementById('customizer-layout01') as HTMLInputElement;
        if (vertical != null) {
          vertical.setAttribute('checked', 'true');
        }
      }
      if (this.attribute == 'horizontal') {
        const horizontal = document.getElementById('customizer-layout02');
        if (horizontal != null) {
          horizontal.setAttribute('checked', 'true');
        }
      }
      if (this.attribute == 'twocolumn') {
        const Twocolumn = document.getElementById('customizer-layout03');
        if (Twocolumn != null) {
          Twocolumn.setAttribute('checked', 'true');
        }
      }
    }, 0);
  }

  closeoffcanvas() {
    document.querySelector('.righsidebar')?.classList.remove('show')
    document.querySelector('.backdrop2')?.classList.remove('show')
  }
  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.layout = layout;
    this.store.dispatch(changelayoutTheme({ layout }));
    this.eventService.broadcast('changeLayout', layout);
    this.store.select(getLayout).pipe(take(1)).subscribe((layout) => {
      document.documentElement.setAttribute('data-layout', layout);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 1500);
    })
  }

  // change theme
  changeTheme(theme: string) {
    this.spinner.show();
    this.layoutTheme = theme;
    // store
    this.store.dispatch(changeTheme({ theme }));
    this.store.select(getLayoutTheme).pipe(take(1)).subscribe((theme) => {
      this.renderer.setAttribute(document.documentElement, 'data-bs-theme', theme);
    })
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
    if (theme == 'minimal') {
      this.renderer.setAttribute(document.documentElement, 'data-sidebar', 'light');
    } else {
      this.renderer.setAttribute(document.documentElement, 'data-sidebar', 'dark');
    }
  }

  // Sidebar Size Change
  changeSidebar(sidebarView: string) {
    this.sidebarViews = sidebarView;
    this.store.dispatch(changesidebarView({ sidebarView }));
    this.store.select(getsidebarview).pipe(take(1)).subscribe((sidebarView) => {
      this.renderer.setAttribute(document.documentElement, 'data-layout-style', sidebarView);
    })
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  // Sidebar Size Change
  changeSidebarSize(size: string) {    
    this.sidebarsize = size;
    // store
    setTimeout(() => {
      this.store.dispatch(changesize({ size }));
      this.store.select(getSidebarsize).pipe(take(1)).subscribe((size) => {
        this.renderer.setAttribute(document.documentElement, 'data-sidebar-size', size);
      })
    }, 0);

  }

  // Add Active Class
  addActive(grdSidebar: any) {
    this.sidebarcolor = grdSidebar;
    this.grd = grdSidebar;
    document.documentElement.setAttribute('data-sidebar', grdSidebar)
    document.getElementById('collapseBgGradient')?.classList.toggle('show');
    document.getElementById('collapseBgGradient1')?.classList.add('active');
  }

  // Remove Active Class
  removeActive() {
    this.grd = '';
    document.getElementById('collapseBgGradient1')?.classList.remove('active');
    document.getElementById('collapseBgGradient')?.classList.remove('show');
  }

  // When the user clicks on the button, scroll to the top of the document
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  // Mode Change
  changeMode(mode: string) {
    this.layoutmode = mode;
    this.store.dispatch(changeMode({ mode }));
    this.store.select(getLayoutmode).pipe(take(1)).subscribe((mode) => {
      this.renderer.setAttribute(document.documentElement, 'data-bs-theme', mode);
    })
    if (mode === 'light') {
      this.renderer.setAttribute(document.documentElement, 'data-topbar', 'light');
    } else {
      this.renderer.setAttribute(document.documentElement, 'data-topbar', mode);
    }
  }

  // Sidebar Color Change
  changeSidebarColor(sidebar: string) {
    this.sidebarcolor = sidebar;
    setTimeout(() => {
      this.store.dispatch(changesidebarcolor({ sidebar }));
      this.store.select(getSidebarcolor).pipe(take(1)).subscribe((sidebar) => {
        this.renderer.setAttribute(document.documentElement, 'data-sidebar', sidebar);
      })
    }, 0);
  }

  // Width Change
  changeWidth(width: string, size: string) {
    this.layoutWidth = width;
    this.store.dispatch(changewidthLayout({ width }));
    this.store.select(getLayoutWidth).pipe(take(1)).subscribe((width) => {
      this.renderer.setAttribute(document.documentElement, 'data-layout-width', width);
    })
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      document.documentElement.setAttribute('data-sidebar-size', size);
    }, 0);
  }
  // Position Change
  changePosition(position: string) {
    this.layoutposition = position;
    this.store.dispatch(changeposition({ position }));
    this.store.select(getPosition).pipe(take(1)).subscribe((position) => {
      this.renderer.setAttribute(document.documentElement, 'data-layout-position', position);
    })
  }

  // Topbar Change
  changeTopColor(topbar: string) {
    this.topbar = topbar;
    this.store.dispatch(changetopbar({ topbar }));
    this.store.select(getTopbar).pipe(take(1)).subscribe((topbar) => {
        this.renderer.setAttribute(document.documentElement, 'data-topbar', topbar);
    });
  }

  // Sidebar Image Change
  changeSidebarImage(sidebarImage: string) {
    this.sidebarimage = sidebarImage;
    this.store.dispatch(changesidebarImage({ sidebarImage }));
    this.store.select(getsidebarimage).pipe(take(1)).subscribe((sidebarImage) => {
      this.renderer.setAttribute(document.documentElement, 'data-sidebar-image', sidebarImage);
    })
  }

  // PreLoader Image Change
  changeLoader(preLoader: string) {
    this.preloader = preLoader;
    this.store.dispatch(changepreLoader({ preLoader }));
    this.store.select(getPreloader).pipe(take(1)).subscribe((preLoader) => {
      this.renderer.setAttribute(document.documentElement, 'data-preloader', preLoader);
    })
    var preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => {
        this.renderer.setStyle(preloader, 'opacity', '0')
        this.renderer.setStyle(preloader, 'visibility', 'hidden')
      }, 1000);
    }
  }
}
