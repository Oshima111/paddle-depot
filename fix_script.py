with open('src/components/ProductGrid.tsx') as f:
    content = f.read()

# Fix 1: Close the search bar container properly
content = content.replace(
    '          )}\n        </div>\n\n      <div className="flex flex-wrap justify-center gap-2 mb-6">',
    '          )}\n        </div>\n      </div>\n\n      <div className="flex flex-wrap justify-center gap-2 mb-6">'
)

# Fix 2: Close the featured <div> properly
content = content.replace(
    '              </div>\n          )}\n\n          {regular.length > 0 && (',
    '              </div>\n            </div>\n          )}\n\n          {regular.length > 0 && ('
)

# Fix 3: Close the regular section <div> properly
content = content.replace(
    '              </div>\n          )}\n        </div>\n      )}\n    </section>',
    '              </div>\n            </div>\n          )}\n        </div>\n      )}\n    </section>'
)

with open('src/components/ProductGrid.tsx', 'w') as f:
    f.write(content)
print('Fixed!')
