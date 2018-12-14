class Sprite {
    static new(w, h, random) {
        return {
            w: w,
            h: h,

            name: '',
            colorId: 1,
            wall: false,
            item: false,
            actions: [],
            frames: random ? [Frame.random(w, h)] : [Frame.new(w, h)],

            currentFrameId: 0
        }
    }

    static import(obj, w, h, spriteId, sprites, codeMap) {
        if (obj.w !== w || obj.h !== h) throw 'sprite is the wrong size'

        let sprite = Sprite.new(w, h)

        if (isArr(obj.relatedSprites) && spriteId && sprites) {
            let nextId = sprites.length
            codeMap = { 0: spriteId }
            obj.relatedSprites.forEach((_, index) => {
                codeMap[index + 1] = nextId
                nextId++
            })
            sprite.relatedSprites = obj.relatedSprites.map(s => Sprite.import(s, w, h, null, null, codeMap))
        }

        if (isStr(obj.name)) sprite.name = obj.name
        if (isInt(obj.colorId)) sprite.colorId = obj.colorId
        if (isBool(obj.wall)) sprite.wall = obj.wall
        if (isBool(obj.item)) sprite.item = obj.item
        if (isArr(obj.actions)) {
            sprite.actions = obj.actions.map(a => Action.import(a, codeMap))
        }
        if (isArr(obj.frames)) {
            sprite.frames = obj.frames.map(f => Frame.import(f, w, h))
        }

        return sprite
    }

    static export(sprite, spriteId, sprites, codeMap) {
        let relatedSprites
        if (sprites) {
            relatedSprites = []
            codeMap = {}
            codeMap[spriteId] = 0
            let relatedSpriteIds = Sprite.relatedSpriteIds(sprite, spriteId, sprites)
            relatedSpriteIds.forEach((id, index) => {
                codeMap[id] = index + 1
            })
            relatedSprites = relatedSpriteIds.map(id =>
                Sprite.export(sprites[id], null, null, codeMap)
            )
        }

        return {
            type: 'sprite',
            w: sprite.w,
            h: sprite.h,
            name: sprite.name,
            colorId: sprite.colorId,
            wall: sprite.wall,
            item: sprite.item,
            actions: sprite.actions.map(action => Action.export(action, codeMap)),
            frames: sprite.frames.map(frame => Frame.export(frame)),
            relatedSprites
        }
    }

    static clone(sprite) {
        return Sprite.import(sprite, sprite.w, sprite.h)
    }

    static bumpSpriteId(sprite, spriteId) {
        sprite.actions = sprite.actions.map(action => Action.bumpSpriteId(action, spriteId))
        return sprite
    }

    static flip(sprite, horizontal) {
        sprite.frames.forEach(frame => Frame.flip(frame, horizontal))
    }

    static addFrame(sprite, frameId) {
        frameId = exists(frameId) ? frameId : sprite.frames[sprite.currentFrameId]
        let newFrame = Frame.clone(sprite.frames[frameId])
        sprite.frames.push(newFrame)
        return sprite
    }

    static delFrame(sprite, i) {
        if (sprite.frames.length === 1) return sprite // can't delete last frame
        sprite.frames.splice(i, 1)
        return sprite
    }

    static nextFrame(sprite) {
        if (sprite.frames.length === 0) return sprite // can't progress if no frames
        sprite.currentFrameId++
        if (sprite.currentFrameId >= sprite.frames.length) sprite.currentFrameId = 0
        return sprite
    }

    static addAction(sprite) {
        let newAction = Action.new()
        sprite.actions.push(newAction)
        return sprite
    }

    static delAction(sprite, i) {
        sprite.actions.splice(i, 1)
        return sprite
    }

    static relatedSpriteIds(sprite, spriteId, sprites) {
        let ids = []
        sprite.actions.forEach(action => {
            ids = ids.concat(Action.relatedSpriteIds(action))
        })

        if (sprites) {
            let idsToGo = uniqueList(ids)
            while (idsToGo.length) {
                let newIds = []
                idsToGo.forEach(id => {
                    let relatedIds = Sprite.relatedSpriteIds(sprites[id])
                    let newRelatedIds = relatedIds.filter(x => !ids.includes(x))
                    newIds = newIds.concat(newRelatedIds)
                })
                ids = ids.concat(newIds)
                idsToGo = uniqueList(newIds)
            }
        }

        if (spriteId) ids = ids.filter(id => id !== spriteId)

        return uniqueList(ids)
    }

    static draw(sprite, context, { x, y, frameId, palette, clear, background }) {
        if (!exists(frameId)) frameId = sprite.currentFrameId
        if (frameId >= sprite.frames.length) frameId = 0      
        if (!exists(sprite.frames[frameId])) return // can't draw frame that doesn't exist

        x = x || 0
        y = y || 0

        if (clear) {
            context.clearRect(x, y, x + sprite.w, y + sprite.h)
        }

        if (background) {
            context.fillStyle = palette.colors[0]
            context.fillRect(x, y, x + sprite.w, y + sprite.h)
        }

        context.fillStyle = palette.colors[sprite.colorId] || palette.colors[1] || '#000'
        Frame.draw(sprite.frames[frameId], context, x, y)
    }
}