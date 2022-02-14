/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2021, Avonni Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Compute an item key value.
 *
 * @param {string} parentKey Key of the parent item.
 * @param {number} childNum Number of the item in the parent.
 * @returns {string} Key of the item.
 */
function computeKey(parentKey, childNum) {
    if (!parentKey) {
        return '0';
    }
    if (parentKey === '0') {
        return `${childNum}`;
    }
    return `${parentKey}.${childNum}`;
}

/**
 * Create a usable tree item object.
 *
 * @param {object} node Original item.
 * @param {number} level Depth level of the item in the tree.
 * @param {string} parentKey Key of the parent item.
 * @param {number} childNum Number of the item in its parent.
 * @returns {object} Tree node object.
 */
export function getTreeNode(node, level, parentKey, childNum) {
    return {
        avatar: node.avatar,
        children: [],
        disabled: node.disabled || false,
        get expanded() {
            return this.isLeaf && !this.isLoading
                ? true
                : node.expanded || false;
        },
        fields: node.fields,
        href: node.href,
        isLeaf:
            !node.isLoading &&
            (!node.items ||
                (Array.isArray(node.items) && node.items.length === 0)),
        isLoading: node.isLoading || false,
        key: computeKey(parentKey, childNum),
        label: node.label,
        level,
        metatext: node.metatext,
        name: node.name,
        nodeRef: node,
        visible: level === 1,
        visibleItems: []
    };
}
