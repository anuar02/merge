import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DirectoryTreeComponent} from "../../directory/presentation/ui";
import {provideDirectoryCatalog} from "../../directory/presentation/directory-catalog-provider";

@NgModule({
    imports: [
        CommonModule,
        DirectoryTreeComponent
    ],
    providers: [
        ...provideDirectoryCatalog()
    ]
})
export class CollectionsModule { }
