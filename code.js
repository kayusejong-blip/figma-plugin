figma.showUI(__html__, { width: 400, height: 600 });

async function createTextNode(name, text, x, y, size, isBold, r, g, b) {
    const textNode = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: isBold ? "Bold" : "Regular" });
    textNode.fontName = { family: "Inter", style: isBold ? "Bold" : "Regular" };
    textNode.characters = text;
    textNode.name = name;
    textNode.fontSize = size;
    textNode.x = x;
    textNode.y = y;
    textNode.fills = [{ type: 'SOLID', color: { r, g, b } }];
    return textNode;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-curation') {
    const products = msg.products;
    let template = figma.currentPage.findOne(n => n.name === '#Template' && n.type === 'FRAME');
    
    if (!template) {
        figma.notify("✨ 빈 도화지 감지! 프리미엄 템플릿을 코드로 즉석 렌더링합니다...");
        
        template = figma.createFrame();
        template.name = '#Template';
        template.layoutMode = 'VERTICAL';
        template.primaryAxisSizingMode = 'AUTO';
        template.counterAxisSizingMode = 'FIXED';
        template.resize(960, 100);
        template.paddingLeft = 56;
        template.paddingRight = 56;
        template.paddingTop = 56;
        template.paddingBottom = 72;
        template.itemSpacing = 40;
        template.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        template.cornerRadius = 48;
        template.effects = [{
            type: 'DROP_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.08 },
            offset: { x: 0, y: 24 },
            radius: 48,
            visible: true,
            blendMode: 'NORMAL'
        }];

        // [Image Area]
        const imgBox = figma.createRectangle();
        imgBox.name = 'Image Area';
        imgBox.layoutAlign = 'STRETCH';
        imgBox.resize(840, 840);
        imgBox.fills = [{ type: 'SOLID', color: { r: 0.92, g: 0.93, b: 0.95 } }];
        imgBox.cornerRadius = 24;
        template.appendChild(imgBox);

        // [Content Block]
        const contentBlock = figma.createFrame();
        contentBlock.name = 'Content Block';
        contentBlock.layoutMode = 'VERTICAL';
        contentBlock.layoutAlign = 'STRETCH';
        contentBlock.primaryAxisSizingMode = 'AUTO';
        contentBlock.counterAxisSizingMode = 'STRETCH';
        contentBlock.itemSpacing = 20;
        contentBlock.fills = [];

        // [순위 뱃지] 그린
        const rankPill = figma.createFrame();
        rankPill.name = 'Rank Pill';
        rankPill.layoutMode = 'HORIZONTAL';
        rankPill.primaryAxisSizingMode = 'AUTO';
        rankPill.counterAxisSizingMode = 'AUTO';
        rankPill.paddingLeft = 20;
        rankPill.paddingRight = 20;
        rankPill.paddingTop = 14;
        rankPill.paddingBottom = 14;
        rankPill.cornerRadius = 100;
        rankPill.fills = [{ type: 'SOLID', color: { r: 0.25, g: 0.65, b: 0.32 } }];
        const rankNode = await createTextNode('#rank', '1위', 0, 0, 22, true, 1, 1, 1);
        rankPill.appendChild(rankNode);
        contentBlock.appendChild(rankPill);

        // [상품명]
        const nameNode = await createTextNode('#product_name', '[브랜드] 프리미엄 상품명 명시', 0, 0, 48, true, 0.1, 0.12, 0.15);
        nameNode.layoutAlign = 'STRETCH';
        nameNode.textAutoResize = 'HEIGHT';
        contentBlock.appendChild(nameNode);

        // [마케팅 카피]
        const descNode = await createTextNode('#description', '상품을 사야 하는 매력적인 이유가 이곳에 적힙니다.\n깔끔하고 모던한 감성으로 시선을 사로잡아 보세요.', 0, 0, 26, false, 0.4, 0.45, 0.5);
        descNode.lineHeight = { value: 160, unit: 'PERCENT' };
        descNode.layoutAlign = 'STRETCH';
        descNode.textAutoResize = 'HEIGHT';
        contentBlock.appendChild(descNode);

        template.appendChild(contentBlock);
        figma.currentPage.appendChild(template);
    }

    figma.notify("✅ 제미나이 큐레이션 완료! 즉시 데이터를 주입하고 복제합니다...");

    try {
      const startX = template.x + template.width + 100;
      let currX = startX;

      for (let i = 0; i < products.length; i++) {
        const item = products[i];
        const clone = template.clone();
        clone.x = currX;
        clone.name = `Slide ${i+1} - ${item.product_name}`;
        figma.currentPage.appendChild(clone);
        currX += clone.width + 100;

        const textNodes = clone.findAllWithCriteria({ types: ['TEXT'] });
        for (const tNode of textNodes) {
            await figma.loadFontAsync(tNode.fontName);
            if (tNode.name === '#rank') tNode.characters = item.rank;
            if (tNode.name === '#product_name') tNode.characters = item.product_name;
            if (tNode.name === '#description') tNode.characters = item.description;
        }
      }
      figma.notify("🎉 복제 마법 완벽 성공! 이미지만 쏙쏙 드래그 앤 드롭 하십쇼!");
    } catch (err) {
      figma.notify("복제 중 에러가 발생했습니다.");
      console.error(err);
    }
  }
};
