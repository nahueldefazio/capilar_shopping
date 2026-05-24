import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category, SaleType } from '../../../core/models';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  isEdit = signal(false);
  productId = signal<string | null>(null);
  saved = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    categoryName: [''],
    saleType: ['retail' as SaleType, Validators.required],
    imageUrl: [''],
    isActive: [true],
    featured: [false],
  });

  ngOnInit(): void {
    this.categories.set(this.categoryService.getCategories());

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
      const cat = this.categories().find((c) => c.id === catId);
      if (cat) this.form.get('categoryName')?.setValue(cat.name, { emitEvent: false });
    });
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

    if (this.isEdit() && this.productId()) {
      this.productService.updateProduct(this.productId()!, {
        name: v.name!,
        slug: v.slug!,
        description: v.description!,
        price: v.price!,
        stock: v.stock!,
        categoryId: v.categoryId!,
        categoryName: v.categoryName ?? '',
        saleType: v.saleType as SaleType,
        imageUrl: v.imageUrl ?? '',
        isActive: v.isActive ?? true,
        featured: v.featured ?? false,
      });
    } else {
      this.productService.createProduct({
        name: v.name!,
        slug: v.slug!,
        description: v.description!,
        price: v.price!,
        stock: v.stock!,
        categoryId: v.categoryId!,
        categoryName: v.categoryName ?? '',
        saleType: v.saleType as SaleType,
        imageUrl: v.imageUrl ?? '',
        isActive: v.isActive ?? true,
        featured: v.featured ?? false,
      });
    }

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
}
