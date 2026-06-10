import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { SaleType } from '../../../core/models';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ImageUploadComponent, LoadingComponent],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories = this.categoryService.categories;
  categoryOptions = computed(() => {
    const categories = this.categories();
    const rootCategories = categories.filter((cat) => !cat.parentId);
    const childCategories = categories.filter((cat) => cat.parentId);

    return [
      ...rootCategories,
      ...childCategories.map((cat) => ({ ...cat, name: `${this.parentName(cat.parentId)} / ${cat.name}` })),
    ];
  });
  isEdit = signal(false);
  productId = signal<string | null>(null);
  saved = signal(false);
  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    weightGrams: [500, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    categoryName: [''],
    saleType: ['retail' as SaleType, Validators.required],
    imageUrl: [''],
    isActive: [true],
    featured: [false],
  });

  ngOnInit(): void {
    this.productService.load();
    this.categoryService.load();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true);
      this.productId.set(id);
      const product = this.productService.getAllProductsAdmin().find((p) => p.id === id);
      if (product) this.form.patchValue(product);
    }

    this.form.get('name')?.valueChanges.subscribe((name) => {
      if (!this.isEdit()) {
        this.form.get('slug')?.setValue(this._slugify(name ?? ''), { emitEvent: false });
      }
    });

    this.form.get('categoryId')?.valueChanges.subscribe((catId) => {
      const cat = this.categories().find((c) => c.id === String(catId));
      if (cat) this.form.get('categoryName')?.setValue(cat.name, { emitEvent: false });
    });
  }

  onImageUrlChange(url: string): void {
    this.form.get('imageUrl')?.setValue(url);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;

    const productData = {
      name: v.name!,
      slug: v.slug!,
      description: v.description!,
      price: v.price!,
      stock: v.stock!,
      weightGrams: v.weightGrams ?? 500,
      categoryId: v.categoryId!,
      categoryName: v.categoryName ?? '',
      saleType: v.saleType as SaleType,
      imageUrl: v.imageUrl ?? '',
      isActive: v.isActive ?? true,
      featured: v.featured ?? false,
    };

    if (this.isEdit() && this.productId()) {
      this.productService.updateProduct(this.productId()!, productData);
    } else {
      this.productService.createProduct(productData);
    }

    this.saving.set(true);
    this.saved.set(true);
    setTimeout(() => this.router.navigate(['/admin/productos']), 1500);
  }

  private _slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 60);
  }

  private parentName(parentId: string | null | undefined): string {
    return this.categories().find((cat) => cat.id === parentId)?.name ?? 'Principal';
  }
}
