function getResultEE() {
	EE().getHTML(document.getElementById('result'));
}

const EE = (function() {
	const workzone = document.getElementById('workzone');
	let instance;
	if (document.doctype)
		console.warn(
			'Easy email may not properly work in documents with a declared Doctype'
		);

	class EasyEmail {
		constructor() {
			this.elements = {};
			this.currentElement = null;
			this.fallbackFont = null;
			this.globalFont = 'Arial';
			// TODO
			// this.defaultStyles =
		}

		checkNan(n, name) {
			let check = Number(n);
			if (isNaN(check))
				throw new Error(
					name + ' must be a number only, with no units (px, em, rem)'
				);
		}

		resetElement() {
			this.currentElement = null;
		}

		define(id) {
			let table = document.createElement('table');
			table.style.borderCollapse = 'collapse';
			table.style.borderSpacing = '0px';
			table.cellPadding = '0';
			table.cellSpacing = '0';
			table.border = '0';
			table.id = id;
			table.style.backgroundColor = '#fff';
			let tbody = document.createElement('tbody');
			table.appendChild(tbody);
			this.elements[id] = table;
			this.currentElement = table;
			return this;
		}

		getGoogleFont(src) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = src;
			const init = document.createComment('[if !mso]><!');
			const end = document.createComment('<![endif]');
			document.head.appendChild(init);
			document.head.appendChild(link);
			document.head.appendChild(end);
			return this;
		}

		useGlobalFont(font, fallback) {
			if (!fallback) {
				console.warn(
					'Fallback is important for outlook. Please provide a fallback font family.'
				);
			}
			this.fallbackFont = fallback;
			this.globalFont = `${font}, ${fallback} !important`;
			return this;
		}

		width(width) {
			this.checkNan(width, 'width');
			this.currentElement.width = width;
			this.currentElement.style.width = width;
			return this;
		}

		start() {
			workzone.appendChild(this.currentElement);
			return this;
		}

		bodyColor(color) {
			document.querySelector('body').style.backgroundColor = color;
			return this;
		}

		row(id = null) {
			let tr = document.createElement('tr');
			let td = document.createElement('td');
			td.vAlign = 'top';
			if (id) {
				tr.id = id;
				this.elements[id] = tr;
			}
			td.id = 'unique';

			let parent;

			if (
				this.currentElement &&
				this.currentElement.tagName === 'TABLE'
			) {
				parent = this.currentElement.childNodes[0];
			} else {
				let anaylizingElement = this.currentElement;
				do {
					parent = anaylizingElement.parentNode;
					anaylizingElement = parent;
				} while (parent.tagName !== 'TR');
				let newParent = parent.parentNode;
				// REMOVE TR IF IT IS EMPTY, SO WE DONT APPEND A NEW TR O A TR WITH AN EMPTY TD
				if (
					newParent.childNodes[0].childNodes[0].childNodes.length ===
					0
				) {
					parent.remove();
				}
				parent = newParent;
			}
			parent.appendChild(tr);
			tr.appendChild(td);

			this.currentElement = td;

			return this;
		}

		append(id) {
			const element = this.elements[id];
			if (!element || typeof element === 'undefined')
				throw new Error(
					`You provided an invalid element (${id}) for method 'append'`
				);
			element.appendChild(this.currentElement);
		}

		appendTo(el) {
			el.appendChild(this.currentElement);
			return this;
		}

		get(id) {
			return this.elements[id];
		}

		columns(n) {
			if (this.currentElement.id !== 'unique')
				throw new Error('Columns method can only be used inside a row');
			const parentTd = this.currentElement;

			// CREATE A NEW TABLE, SET ITS WIDTH, APPEND IT TO CURRENT ELEMENT AND CREATE A ROW BEFORE ADDING THE COLUMNS
			this.define(this.currentElement.parentNode.id + '-container')
				.width(this.get('container').style.width.slice(0, -2))
				.appendTo(parentTd)
				.row();

			for (let i = 0; i < n; i++) {
				let td;
				if (i === 0) {
					td = this.currentElement;
				} else {
					td = document.createElement('td');
					td.vAlign = 'top';
				}
				// IF CURRENT ROW DOESNT HAVE AN ID, IT MEANS WE ARE IN A NESTED TABLE. WE NEED THAT ID SO WE SEARCH IT IN THE WHILE LOOP. ELSE, JUST USE THE CURRENT TR
				if (!this.currentElement.parentNode.id) {
					let parent;
					let anaylizingElement = this.currentElement.parentNode;
					do {
						parent = anaylizingElement.parentNode;
						anaylizingElement = parent;
					} while (parent.tagName !== 'TR');
					td.id = parent.id + '-' + (i + 1);
				} else {
					td.id = this.currentElement.parentNode.id + '-' + (i + 1);
				}
				this.elements[td.id] = td;
				this.currentElement.parentNode.appendChild(td);
			}
			// NORMALLY WE WOULD JUST STAY INSIDE THE TD, BUT NOW WE HAVE MORE COLUMNS, SO WE WILL STAY IN THE PARENT INSTEAD
			if (this.currentElement.id !== 'unique')
				this.currentElement = this.currentElement.parentNode;
			return this;
		}

		spaceBetween(n) {
			let cloneRow = this.currentElement.cloneNode(true);
			let appendedCount = 0;
			for (
				let i = 0;
				i < Array.from(cloneRow.childNodes).length - 1;
				i++
			) {
				const td = document.createElement('td');
				td.vAlign = 'top';
				const span = document.createElement('span');
				span.innerHTML = '&nbsp;'.repeat(n);
				td.appendChild(span);
				this.currentElement.childNodes[i + appendedCount].after(td);
				appendedCount++;
			}
			return this;
		}

		in(id) {
			const element = this.elements[id];
			if (!element || typeof element === 'undefined')
				throw new Error(
					`You provided an invalid element (${id}) for method 'in'`
				);
			element.appendChild(this.currentElement);
			return this;
		}

		inlineText(text, id = null, subquery = null) {
			const span = document.createElement('span');
			const innerFontWrapper = document.createElement('span');
			innerFontWrapper.innerText = text;
			innerFontWrapper.style.fontFamily = this.globalFont;
			innerFontWrapper.setAttribute('valign', 'middle');
			span.style.fontFamily = this.fallbackFont;
			span.appendChild(innerFontWrapper);
			span.style.margin = '0';
			span.style.fontSize = 16 / 1.3 + 'pt';
			span.setAttribute('valign', 'middle');
			span.style.verticalAlign = 'middle';
			if (id) {
				span.id = id;
				this.elements[id] = span;
			}
			if (
				typeof this.currentElement.childNodes[0] !== 'undefined' &&
				this.currentElement.childNodes[0].tagName === 'TABLE'
			) {
				this.currentElement.childNodes[0].childNodes[0].childNodes[0].appendChild(
					p
				);
			} else this.currentElement.appendChild(span);

			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				this.manageSubquery(span, subquery);
			}

			return this;
		}

		button(options, id = null, subquery = null) {
			if (
				typeof options.paddingX === 'undefined' ||
				options.paddingX == 0
			)
				options.paddingX = 1;
			if (
				typeof options.paddingY === 'undefined' ||
				options.paddingY < 10
			) {
				options.paddingY = 10;
			}
			if (options.paddingY > 10)
				console.warn(
					"PaddingY greater than 10 in button won't work correctly in outlook. You can't still use it for the rest of the email clients, but beware of possible layout issues if you're relying on padding for it."
				);

			this.checkNan(options.width, 'Button');
			this.checkNan(options.fontSize, 'Button');
			this.checkNan(options.paddingX, 'Button');
			this.checkNan(options.borderRadius, 'Button');
			const button = `
			<!--[if mso]>
			  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${
					options.to
				}" style="height:36px;v-text-anchor:middle;width:${
				options.width
			}px;" arcsize="${options.borderRadius}%" strokecolor="${
				options.backgroundColor
			}" fillcolor="${options.backgroundColor}">
			    <w:anchorlock/>
			    <center style="color:${options.color};font-family:${
				this.globalFont
			}; font-size:${16 / 1.3}pt;">${options.text}</center>
				</v:roundrect>
				<div style="width:0px; height:0px; overflow:hidden; display:none; visibility:hidden; mso-hide:all;">
			<![endif] -->
				
				<a id="${id || ''}" style="border-radius: ${
				options.borderRadius
			}%; webkit-border-radius: ${
				options.borderRadius
			}%; moz-border-radius: ${options.borderRadius}%; font-family:${
				this.fallbackFont
			}; background-color: ${
				options.backgroundColor
			}; border-bottom: 0; color: inherit; text-decoration: none; font-size: inherit; font-weigth: inherit; line-height: inherit; width: ${
				options.width
			}; border-top: ${options.paddingY}px solid ${
				options.backgroundColor
			}; border-bottom: ${options.paddingY}px solid ${
				options.backgroundColor
			}; border-right: ${options.paddingX}px solid ${
				options.backgroundColor
			}; border-left: ${options.paddingX}px solid ${
				options.backgroundColor
			}" valign="middle" href="${options.to}">
				<span style="font-family: ${this.globalFont}; margin: 0; font-size: ${16 /
				1.3}pt; background-color: ${options.backgroundColor}; color: ${
				options.color
			}" valign="middle">
						${options.text}
					</span>
			</a>
			
			<!--[if mso]></div><![endif]-->`;
			if (
				typeof this.currentElement.childNodes[0] !== 'undefined' &&
				this.currentElement.childNodes[0].tagName === 'TABLE'
			) {
				throw new Error('Create a row before attaching a button');
			} else {
				this.currentElement.innerHTML = button;
			}

			if (id) {
				this.elements[id] = this.currentElement.childNodes[3];
			}

			const subId = id + 'c-' + (Math.random() * 1000).toFixed(2);

			this.elements[
				subId
			] = this.currentElement.childNodes[3].childNodes[1];
			this.currentElement.childNodes[3].childNodes[1].id = subId;
			if (options.paddingX) {
				this.manageSubquery(
					this.currentElement.childNodes[3].childNodes[1],
					span =>
						span.marginX(
							Number(options.paddingX),
							true,
							options.backgroundColor
						)
				);
			}

			return this;
		}

		inlineLink(to, text, id = null, subquery = null) {
			const span = document.createElement('span');
			const innerFontWrapper = document.createElement('a');
			innerFontWrapper.setAttribute('href', to);
			innerFontWrapper.innerText = text;
			innerFontWrapper.style.fontFamily = this.globalFont;
			innerFontWrapper.style.borderBottom = '0';
			innerFontWrapper.style.color = 'inherit !important';
			innerFontWrapper.style.textDecoration = 'none';
			innerFontWrapper.style.fontSize = 'inherit';
			innerFontWrapper.style.fontWeight = 'inherit';
			innerFontWrapper.style.lineHeight = 'inherit';
			innerFontWrapper.setAttribute('valign', 'middle');
			span.style.fontFamily = this.fallbackFont;
			span.appendChild(innerFontWrapper);
			span.style.margin = '0';
			span.style.fontSize = 16 / 1.3 + 'pt';
			span.setAttribute('valign', 'middle');
			span.style.verticalAlign = 'middle';
			if (id) {
				span.id = id;
				this.elements[id] = span;
			}
			if (
				typeof this.currentElement.childNodes[0] !== 'undefined' &&
				this.currentElement.childNodes[0].tagName === 'TABLE'
			) {
				this.currentElement.childNodes[0].childNodes[0].childNodes[0].appendChild(
					span
				);
			} else this.currentElement.appendChild(span);

			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				this.manageSubquery(span, subquery);
			}

			return this;
		}

		blockText(text, id = null, subquery = null) {
			// NORMALLY WE WOULD CREATE AN ELEMENT FOR THE SPAN, BUT IT WASN'T WORKING AND I COULDN'T FIGURE OUT WHY, SO I USED HANDWRITTEN HTML INSTEAD
			const p = document.createElement('p');
			const innerFontWrapper = `<span valign="middle" style='font-family: ${
				this.globalFont
			}'>${text}</span>`;
			p.style.fontFamily = this.fallbackFont;
			p.innerHTML = innerFontWrapper;
			p.style.margin = '0';
			p.style.fontSize = 16 / 1.3 + 'pt';
			p.style.verticalAlign = 'middle';
			p.setAttribute('valign', 'middle');
			if (id) {
				p.id = id;
				this.elements[id] = p;
			}
			if (
				typeof this.currentElement.childNodes[0] !== 'undefined' &&
				this.currentElement.childNodes[0].tagName === 'TABLE'
			) {
				this.currentElement.childNodes[0].childNodes[0].childNodes[0].appendChild(
					p
				);
			} else this.currentElement.appendChild(p);

			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				this.manageSubquery(p, subquery);
			}

			return this;
		}

		blockLink(to, text, id = null, subquery = null) {
			// NORMALLY WE WOULD CREATE AN ELEMENT FOR THE SPAN, BUT IT WASN'T WORKING AND I COULDN'T FIGURE OUT WHY, SO I USED HANDWRITTEN HTML INSTEAD
			const p = document.createElement('p');
			const innerFontWrapper = `<a href="${to}" valign="middle" style='color: inherit !important; font-family: ${
				this.globalFont
			}'>${text}</a>`;
			p.style.fontFamily = this.fallbackFont;
			p.innerHTML = innerFontWrapper;
			p.childNodes[0].style.borderBottom = '0';
			p.childNodes[0].style.color = 'inherit';
			p.childNodes[0].style.textDecoration = 'none';
			p.childNodes[0].style.fontSize = 'inherit';
			p.childNodes[0].style.fontWeight = 'inherit';
			p.childNodes[0].style.lineHeight = 'inherit';
			p.style.margin = '0';
			p.style.fontSize = 16 / 1.3 + 'pt';
			p.style.verticalAlign = 'middle';
			p.setAttribute('valign', 'middle');
			if (id) {
				p.id = id;
				this.elements[id] = p;
			}
			if (
				typeof this.currentElement.childNodes[0] !== 'undefined' &&
				this.currentElement.childNodes[0].tagName === 'TABLE'
			) {
				this.currentElement.childNodes[0].childNodes[0].childNodes[0].appendChild(
					p
				);
			} else this.currentElement.appendChild(p);

			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				this.manageSubquery(p, subquery);
			}

			return this;
		}

		horizontalAlign(type) {
			this.currentElement.align = type;
			this.currentElement.style.textAlign = type;
			this.currentElement.style.marginLeft = 'auto';
			this.currentElement.style.marginRight = 'auto';
			if (
				['IMG', 'P', 'SPAN', 'A'].includes(this.currentElement.tagName)
			) {
				throw new Error(
					"Don't use horizontalAlign in contenct Elementes such as img, p or span. Use this method on its parent instead."
				);
			}
			return this;
		}

		background(color) {
			this.currentElement.style.backgroundColor = color;

			return this;
		}

		emptyLine(n = null) {
			const br = document.createElement('br');
			this.currentElement.append(br);
			if (n) this.currentElement.style.fontSize = n / 1.3 + 'pt';
			return this;
		}

		findUpperTable(node) {
			if (node.parentNode.tagName === 'TABLE') return node.parentNode;
			else return this.findUpperTable(node.parentNode);
		}

		padding(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['P', 'TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingTop = pxs;
			this.currentElement.style.paddingBottom = pxs;
			this.currentElement.style.paddingLeft = pxs;
			this.currentElement.style.paddingRight = pxs;
			return this;
		}

		paddingX(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingLeft = pxs;
			this.currentElement.style.paddingRight = pxs;
			return this;
		}

		paddingY(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingTop = pxs;
			this.currentElement.style.paddingBottom = pxs;
			return this;
		}

		paddingLeft(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['P', 'TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingLeft = pxs;
			return this;
		}

		paddingRight(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['P', 'TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingRight = pxs;
			return this;
		}

		paddingLTop(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['P', 'TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingTop = pxs;
			return this;
		}

		paddingBottom(pxs) {
			this.checkNan(pxs, 'Padding');
			if (['P', 'TABLE'].includes(this.currentElement.tagName))
				throw new Error(
					`Don't use padding on ${this.currentElement.tagName} tags.`
				);
			this.currentElement.style.paddingBottom = pxs;
			return this;
		}

		img(
			src,
			size = 'original',
			id = null,
			alt = null,
			link = null,
			subquery = null
		) {
			if (!src) {
				throw new Error('Src param is required for the img method');
			}
			let img = document.createElement('img');
			img.src = src;
			img.setAttribute('valign', 'middle');
			img.style.verticalAlign = 'middle';
			if (alt) img.alt = alt;
			img.onload = function() {
				const originalWidth = img.width;
				const originalHeight = img.height;
				if (size === 'original' || size == null) {
					img.width = originalWidth;
					img.height = originalHeight;
				} else {
					const [width, height] = size.split('x');
					if (originalWidth == width || originalHeight != height) {
						console.warn(
							'Size set for image',
							img,
							' is different from its original size. This can cause issues in some email clients. Though provided as a paremeter, setting the size is actually not optimal.'
						);
					}
					img.width = width;
					img.style.width = width;
					img.height = height;
					img.style.height = height;
				}
			};
			let linkElement;
			if (link) {
				linkElement = document.createElement('a');
				linkElement.setAttribute('href', link);
				linkElement.style.fontFamily = this.globalFont;
				linkElement.style.borderBottom = '0';
				linkElement.style.color = 'inherit';
				linkElement.style.textDecoration = 'none';
				linkElement.style.fontSize = 'inherit';
				linkElement.style.fontWeight = 'inherit';
				linkElement.style.lineHeight = 'inherit';
				linkElement.setAttribute('valign', 'middle');
				linkElement.appendChild(img);
				this.currentElement.appendChild(linkElement);
			} else {
				this.currentElement.appendChild(img);
			}

			if (id) {
				if (link) {
					linkElement.id = id;
					this.elements[id] = linkElement;
				} else {
					img.id = id;
					this.elements[id] = img;
				}
			}

			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				if (link) {
					this.manageSubquery(linkElement, subquery);
				} else {
					this.manageSubquery(img, subquery);
				}
			}

			return this;
		}

		manageSubquery(el, sq) {
			setTimeout(function() {
				sq(EE().select(el.id));
			});
		}

		weight(n) {
			this.currentElement.style.fontWeight = n;
			return this;
		}

		color(color) {
			this.currentElement.style.color = color;
			return this;
		}

		fontSize(pt) {
			if (
				['SPAN', 'P', 'IMG', 'A'].includes(this.currentElement.tagName)
			) {
				this.currentElement.style.fontSize = pt / 1.3 + 'pt';
			} else {
				throw new Error(
					"Don't use the fontSize method on elements that aren't text or images"
				);
			}
			return this;
		}

		fontFamily(font) {
			this.currentElement.style.fontFamily = font;
			return this;
		}

		select(id) {
			const element = this.elements[id];
			if (!element || typeof element === 'undefined')
				throw new Error(
					`You provided an invalid element (${id}) for method 'select'`
				);
			this.currentElement = element;
			return this;
		}

		marginRight(n) {
			const span = document.createElement('span');
			span.innerHTML = '&nbsp;'.repeat(n);
			span.style.verticalAlign = 'middle';
			span.setAttribute('valign', 'middle');
			this.currentElement.appendChild(span);
			return this;
		}

		marginLeft(n) {
			const span = document.createElement('span');
			span.innerHTML = '&nbsp;'.repeat(n);
			span.style.verticalAlign = 'middle';
			span.setAttribute('valign', 'middle');
			this.currentElement.insertBefore(
				span,
				this.currentElement.firstChild
			);
			return this;
		}

		marginX(n, isButton = false, color = 'black') {
			const span = document.createElement('span');
			span.innerHTML = '&nbsp;'.repeat(n);
			span.style.verticalAlign = 'middle';
			span.setAttribute('valign', 'middle');
			const span2 = document.createElement('span');
			span2.innerHTML = '&nbsp;'.repeat(n + 2);
			span2.style.verticalAlign = 'middle';
			span2.setAttribute('valign', 'middle');
			this.currentElement.insertBefore(
				span,
				this.currentElement.firstChild
			);
			this.currentElement.appendChild(span2);
			if (isButton) {
				const heightFix = document.createElement('span');
				heightFix.innerText = 'H';
				heightFix.style.color = color;
				span.before(heightFix);
			}
			return this;
		}

		marginVerticalHandler(n = 1, type = null) {
			if (!type) {
				throw new Error("Don't");
			}
			if (this.currentElement.tagName === 'TD') {
				for (let i = 0; i < n; i++) {
					const tr = document.createElement('tr');
					const td = document.createElement('td');
					const br = document.createElement('br');
					td.style.fontSize = 6 + 'pt';
					td.appendChild(br);
					tr.appendChild(td);
					if (type === 'top') {
						this.currentElement.parentNode.before(tr);
					} else if (type === 'bottom') {
						this.currentElement.parentNode.after(tr);
					} else if (type === 'both') {
						const secondTr = tr.cloneNode(true);
						this.currentElement.parentNode.before(tr);
						this.currentElement.parentNode.after(secondTr);
					}
				}
			} else if (
				['block', 'inline-block', 'list-item'].includes(
					this.currentElement.style.display ||
						getComputedStyle(this.currentElement, null).display
				)
			) {
				if (type === 'top')
					this.currentElement.style.marginTop = 3 * n + 'px';
				else if (type === 'bottom')
					this.currentElement.style.marginBottom = 3 * n + 'px';
				else if (type === 'both') {
					this.currentElement.style.marginTop = 3 * n + 'px';
					this.currentElement.style.marginBottom = 3 * n + 'px';
				} else throw new Error();
			} else {
				throw new Error(
					"Don't use margin on content inline elements (such as img and text tags)"
				);
			}
			return this;
		}

		marginY(n) {
			return this.marginVerticalHandler(n, 'both');
		}

		marginTop(n) {
			return this.marginVerticalHandler(n, 'top');
		}

		marginBottom(n) {
			return this.marginVerticalHandler(n, 'bottom');
		}

		italic() {
			this.currentElement.style.fontStyle = 'italic';
			return this;
		}

		underline() {
			this.currentElement.style.textDecoration = 'underline';
			return this;
		}

		border(style) {
			if (this.currentElement.tagName === 'TD') {
				const table = this.appendNewTable();
				this.currentElement = table;
				table.style.border = style;
			} else {
				this.currentElement.style.border = style;
			}
			return this;
		}

		appendNewTable() {
			let table = document.createElement('table');
			table.style.borderCollapse = 'collapse';
			table.style.borderSpacing = '0px';
			table.cellPadding = '0';
			table.cellSpacing = '0';
			table.border = '0';
			table.width = '100%';
			let tbody = document.createElement('tbody');
			table.appendChild(tbody);
			this.currentElement.appendChild(table);
			return table;
		}

		borderRadius(px) {
			this.checkNan(px, 'Border radius');
			if (this.currentElement.tagName === 'TD') {
				const table = this.currentElement.parentNode.parentNode
					.parentNode;
				table.style.borderCollapse = 'separate';
				table.style.webkitBorderRadius = px + 'px';
				table.style.mozBorderRadius = px + 'px';
				table.style.borderRadius = px + 'px';
			} else if (this.currentElement.tagName === 'TABLE') {
				this.currentElement.style.borderCollapse = 'separate';
				this.currentElement.style.webkitBorderRadius = px + 'px';
				this.currentElement.style.moztBorderRadius = px + 'px';
				this.currentElement.style.borderRadius = px + 'px';
			} else {
				this.currentElement.style.webkitBorderRadius = px + 'px';
				this.currentElement.style.moztBorderRadius = px + 'px';
				this.currentElement.style.borderRadius = px + 'px';
			}
			return this;
		}

		appendListItems(container, array) {
			array.forEach(item => {
				const li = document.createElement('li');
				li.style.fontFamily = this.fallbackFont;
				li.style.margin = '0';
				li.style.fontSize = 16 / 1.3 + 'pt';
				li.style.verticalAlign = 'middle';
				li.setAttribute('valign', 'middle');

				if (typeof item === 'string') {
					const innerFontWrapper = `<span valign="middle" style='font-family: ${
						this.globalFont
					}'>${item}</span>`;
					li.innerHTML = innerFontWrapper;
				} else if (typeof item === 'object') {
					if (!item.id)
						throw new Error(
							"Don't use object for li without an id"
						);
					const innerFontWrapper = `<span valign="middle" style='font-family: ${
						this.globalFont
					}'>${item.content}</span>`;
					li.innerHTML = innerFontWrapper;
					li.id = item.id;
					this.elements[item.id] = li;
					if (item.style) {
						this.manageSubquery(li, item.style);
					}
				}

				container.appendChild(li);
			});
			return container;
		}

		ul(array, style = 'disc', id = null, subquery = null) {
			let container = document.createElement('ul');
			container.style.listStyleType = style;
			container = this.appendListItems(container, array);

			if (id) {
				container.id = id;
				this.elements[id] = container;
			}
			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				this.manageSubquery(container, subquery);
			}

			this.currentElement.appendChild(container);
			return this;
		}

		ol(array, style = 'number', id = null, subquery = null) {
			let container = document.createElement('ol');
			container.style.listStyleType = style;
			container = this.appendListItems(container, array);
			this.currentElement.appendChild(container);

			if (id) {
				container.id = id;
				this.elements[id] = container;
			}
			if (subquery) {
				if (!id) {
					throw new Error("You can't use a subquery without an id");
				}
				this.manageSubquery(container, subquery);
			}

			return this;
		}

		getHTML(vessel) {
			const source = document.getElementById('workzone');
			const wrap = document.createElement('div');
			wrap.appendChild(source.cloneNode(true));
			vessel.innerText = wrap.innerHTML;
		}
	}

	function createInstance() {
		const object = new EasyEmail();
		return object;
	}

	return function() {
		if (!instance) {
			instance = createInstance();
		}
		instance.resetElement();
		return instance;
	};
})();
