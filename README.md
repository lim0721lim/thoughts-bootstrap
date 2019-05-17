# Thoughts Bootstrap - [AngularJS](https://angularjs.org/) directive to provide high-level front-end framework for client-side controls

Overview
--------
Thoughts Bootstrap is a high-level AngularJS front-end framework for faster and easier web development. It consists of client-side combo box control that combines the functionality of a single-line editor, button editor and dropdown list editor. The editor's dropdown displays a list of items that can be selected by end-users. Selecting an item changes the editor's edit value.

Requirements
------------
  * [AngularJS](https://ajax.googleapis.com/ajax/libs/angularjs/1.7.4/angular.js)
  * [Bootstrap](https://getbootstrap.com/docs/3.3/getting-started)
  * [jQuery](https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.js)
  * [ui-scroll](https://rawgit.com/angular-ui/ui-scroll/master/dist/ui-scroll.js)

Demo
----
Do you want to see directive in action? Visit [demo site](https://next.plnkr.co/edit/o9yJReIw8HGEvbhAMd0r?preview).

Usage
-----
| Method | Description
|--------|------------------------------------------
| getEvents(): object | Returns event.
| getItems(): promise | Returns all items.
| getParameters(): object | Returns parameters.
| getSearchText(): string | Returns searching text.
| getSelectedIndex(): number | Returns the index of the selected item.
| getSelectedItem(): object | Returns selected item.
| getSettings(): object | Returns settings.
| getText(): string | Returns the text of the selected item.
| getValue(): any | Returns the value of the selected item.
| getVisibleFields(): array | Returns visible fields.
| isRowSelected(): boolean | Returns a value indicates whether the row is selected.
| reload(): void | Reload configuration.
| selectRow(condition: (item: object) => boolean): void | Selects row specified by its filtering condition.
| setSelectedIndex(index: number): void | Selects selected item specified by its index.
| setValue(value: any): void | Sets value.
